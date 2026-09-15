"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ui/ActionButton";
import { Avatar } from "@/components/ui/Avatar";
import { Checkbox, Field, Select, Textarea, TextInput } from "@/components/ui/Field";
import { Disclosure } from "@/components/ui/Disclosure";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Stepper } from "@/components/ui/Stepper";
import { CLIENTS, INVOICE_CONTACTS, PAYMENT_TERMS, PROJECTS } from "@/data/mock";
import type { InvoiceDraft, InvoiceLineItem } from "@/lib/types";
import { InvoicePreview, money } from "./InvoicePreview";
import styles from "./InvoiceCreateView.module.css";

type InvoiceCreateViewProps = {
  draft: InvoiceDraft;
  onChange: (next: InvoiceDraft) => void;
  onCancel: () => void;
  onFinalize: () => void;
  onAction: (message: string) => void;
};

const STEPS = [
  { id: "client", label: "Client", question: "Who's this invoice for?", focus: "recipient" },
  { id: "items", label: "Line Items", question: "What are you billing for?", focus: "items" },
  { id: "details", label: "Details", question: "How should it be sent?", focus: "details" },
] as const;

export function InvoiceCreateView({
  draft,
  onChange,
  onCancel,
  onFinalize,
  onAction,
}: InvoiceCreateViewProps) {
  const [step, setStep] = useState(0);
  const clientProjects = PROJECTS.filter((project) => project.client === draft.client);
  const last = step === STEPS.length - 1;

  function patch(next: Partial<InvoiceDraft>) {
    onChange({ ...draft, ...next });
  }

  function patchItem(id: string, next: Partial<InvoiceLineItem>) {
    patch({ items: draft.items.map((item) => (item.id === id ? { ...item, ...next } : item)) });
  }

  return (
    <div className={styles.page}>
      <section className={styles.panel} aria-label="Create invoice">
        <header className={styles.panelHead}>
          <h1 className={styles.panelTitle}>Create invoice</h1>
          <IconButton icon="x" label="Close" onClick={onCancel} />
        </header>

        <div className={styles.panelBody}>
          <h2 className={styles.question}>{STEPS[step].question}</h2>

          {step === 0 ? (
            <>
              <Field label="Name">
                <Select
                  value={draft.client}
                  options={CLIENTS.map((client) => client.name)}
                  onChange={(event) => patch({ client: event.target.value, projects: [] })}
                />
              </Field>
              <Field label="Email">
                <Select
                  value={draft.contact}
                  options={INVOICE_CONTACTS}
                  onChange={(event) => patch({ contact: event.target.value })}
                />
              </Field>

              <Disclosure label="Additional details">
                <Field label="Contact name">
                  <TextInput
                    value={draft.recipient}
                    onChange={(event) => patch({ recipient: event.target.value })}
                  />
                </Field>
                <Field label="Address">
                  <TextInput
                    value={draft.address}
                    onChange={(event) => patch({ address: event.target.value })}
                  />
                </Field>
                <Field label="Tax ID">
                  <TextInput
                    value={draft.taxId}
                    placeholder="Enter tax ID..."
                    onChange={(event) => patch({ taxId: event.target.value })}
                  />
                </Field>
                <div className={styles.logoField}>
                  <span className={styles.fieldLabel}>Logo</span>
                  {draft.logo ? (
                    <div className={styles.logoRow}>
                      <Avatar size="md" initials={draft.client.slice(0, 2).toUpperCase()} />
                      <button
                        type="button"
                        className={styles.textButton}
                        onClick={() => patch({ logo: false })}
                      >
                        Remove
                      </button>
                      <ActionButton
                        icon="link"
                        label="Replace"
                        onClick={() => onAction("Logo upload is mocked here")}
                      />
                    </div>
                  ) : (
                    <ActionButton icon="plus" label="Add logo" onClick={() => patch({ logo: true })} />
                  )}
                </div>
              </Disclosure>

              <div className={styles.group}>
                <h3 className={styles.groupTitle}>Projects</h3>
                <div className={styles.list}>
                  {clientProjects.length === 0 ? (
                    <p className={styles.empty}>No open projects for this client.</p>
                  ) : (
                    clientProjects.map((project) => (
                      <Checkbox
                        key={project.id}
                        label={project.name}
                        meta={`${project.phase} · ${project.used} of ${project.budget}`}
                        checked={draft.projects.includes(project.name)}
                        onChange={(checked) =>
                          patch({
                            projects: checked
                              ? [...draft.projects, project.name]
                              : draft.projects.filter((name) => name !== project.name),
                          })
                        }
                      />
                    ))
                  )}
                </div>
              </div>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <div className={styles.items}>
                {draft.items.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <Field label="Description">
                      <TextInput
                        value={item.item}
                        onChange={(event) => patchItem(item.id, { item: event.target.value })}
                      />
                    </Field>
                    <Field label="Project">
                      <Select
                        value={item.project}
                        options={draft.projects.length > 0 ? draft.projects : ["Unassigned"]}
                        onChange={(event) => patchItem(item.id, { project: event.target.value })}
                      />
                    </Field>
                    <Field label="Qty">
                      <TextInput
                        type="number"
                        min={0}
                        value={item.qty}
                        onChange={(event) => patchItem(item.id, { qty: Number(event.target.value) })}
                      />
                    </Field>
                    <Field label="Price">
                      <TextInput
                        type="number"
                        min={0}
                        value={item.rate}
                        onChange={(event) => patchItem(item.id, { rate: Number(event.target.value) })}
                      />
                    </Field>
                    <div className={styles.itemEnd}>
                      <span className={styles.amount}>{money(item.qty * item.rate)}</span>
                      <IconButton
                        icon="trash"
                        label={`Remove ${item.item}`}
                        onClick={() =>
                          patch({ items: draft.items.filter((entry) => entry.id !== item.id) })
                        }
                      />
                    </div>
                  </div>
                ))}
                {draft.items.length === 0 ? <p className={styles.empty}>No line items yet.</p> : null}
              </div>
              <ActionButton
                icon="plus"
                label="Add line item"
                onClick={() =>
                  patch({
                    items: [
                      ...draft.items,
                      {
                        id: `li-${Date.now()}`,
                        item: "Consulting",
                        project: draft.projects[0] ?? "Unassigned",
                        qty: 1,
                        rate: 2000,
                      },
                    ],
                  })
                }
              />
            </>
          ) : null}

          {step === 2 ? (
            <>
              <Field label="Invoice Number">
                <TextInput
                  value={draft.number}
                  onChange={(event) => patch({ number: event.target.value })}
                />
              </Field>
              <div className={styles.pair}>
                <Field label="Issued">
                  <TextInput
                    trailingIcon="calendar"
                    value={draft.invoiced}
                    onChange={(event) => patch({ invoiced: event.target.value })}
                  />
                </Field>
                <Field label="Due Date">
                  <TextInput
                    trailingIcon="calendar"
                    value={draft.due}
                    onChange={(event) => patch({ due: event.target.value })}
                  />
                </Field>
              </div>
              <Field label="Payment Terms">
                <Select
                  value={draft.terms}
                  options={PAYMENT_TERMS}
                  onChange={(event) => patch({ terms: event.target.value })}
                />
              </Field>

              <Disclosure label="Additional details">
                <Field label="PO Number">
                  <TextInput
                    value={draft.po}
                    placeholder="456-890"
                    onChange={(event) => patch({ po: event.target.value })}
                  />
                </Field>
                <Field label="Note">
                  <Textarea
                    value={draft.note}
                    onChange={(event) => patch({ note: event.target.value })}
                  />
                </Field>
              </Disclosure>

              <div className={styles.group}>
                <h3 className={styles.groupTitle}>Attachments</h3>
                <div className={styles.list}>
                  {draft.attachments.map((file) => (
                    <div key={file.id} className={styles.file}>
                      <span className={styles.fileIcon}>
                        <Icon name="doc" size={16} />
                      </span>
                      <span className={styles.fileCopy}>
                        <span className={styles.fileName}>{file.name}</span>
                        <span className={styles.fileSize}>{file.size}</span>
                      </span>
                      <IconButton
                        icon="trash"
                        label={`Remove ${file.name}`}
                        onClick={() =>
                          patch({
                            attachments: draft.attachments.filter((entry) => entry.id !== file.id),
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
                <ActionButton
                  icon="plus"
                  label="Add Attachment"
                  onClick={() =>
                    patch({
                      attachments: [
                        ...draft.attachments,
                        {
                          id: `at-${Date.now()}`,
                          name: `Timesheet ${draft.attachments.length + 1}.pdf`,
                          size: "234KB",
                        },
                      ],
                    })
                  }
                />
              </div>
            </>
          ) : null}
        </div>

        <footer className={styles.panelFoot}>
          <div className={styles.footSteps}>
            <Stepper
                variant="compact"
                steps={STEPS.map(({ id, label }) => ({ id, label }))}
                current={step}
                onStep={setStep}
              />
          </div>
          <div className={styles.footActions}>
            <button
              type="button"
              className={styles.textButton}
              onClick={() => (step === 0 ? onCancel() : setStep((current) => current - 1))}
            >
              {step === 0 ? "Cancel" : "Back"}
            </button>
            <ActionButton
              icon={last ? "check" : undefined}
              label={last ? "Finalize" : "Next"}
              tone="primary"
              onClick={() => (last ? onFinalize() : setStep((current) => current + 1))}
            />
          </div>
        </footer>
      </section>

      {/* Pinned across every step, with the bracket following the open step. */}
      <div className={styles.previewPane}>
        <InvoicePreview draft={draft} focus={STEPS[step].focus} onAction={onAction} />
      </div>
    </div>
  );
}
