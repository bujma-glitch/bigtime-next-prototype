"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ui/ActionButton";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { USER } from "@/data/mock";
import type { InvoiceDraft } from "@/lib/types";
import styles from "./InvoicePreview.module.css";

type InvoicePreviewProps = {
  draft: InvoiceDraft;
  /** Which part of the document the current step edits — gets the focus ring. */
  focus?: "recipient" | "items" | "details";
  onAction: (message: string) => void;
};

const ZOOM_STEPS = [0.7, 0.85, 1, 1.15, 1.3];

export function InvoicePreview({ draft, focus = "recipient", onAction }: InvoicePreviewProps) {
  const [zoom, setZoom] = useState(2);
  const [page, setPage] = useState(0);
  const pages = draft.attachments.length > 0 ? 2 : 1;

  const subtotal = draft.items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const tax = subtotal * 0.08;

  return (
    <div className={styles.preview}>
      <div className={styles.bar}>
        <div className={styles.zoom}>
          <IconButton
            icon="plus"
            label="Zoom in"
            disabled={zoom === ZOOM_STEPS.length - 1}
            onClick={() => setZoom((current) => Math.min(ZOOM_STEPS.length - 1, current + 1))}
          />
          <IconButton
            icon="minus"
            label="Zoom out"
            disabled={zoom === 0}
            onClick={() => setZoom((current) => Math.max(0, current - 1))}
          />
        </div>
        <div className={styles.pager}>
          <ActionButton
            icon="chevron-left"
            label="Previous"
            aria-label="Previous page"
            disabled={page === 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
          />
          <p className={styles.pageCount}>
            {page + 1} from {pages}
          </p>
          <ActionButton
            icon="chevron-right"
            label="Next"
            aria-label="Next page"
            disabled={page >= pages - 1}
            onClick={() => setPage((current) => Math.min(pages - 1, current + 1))}
          />
        </div>
      </div>

      <div className={styles.stage}>
        <div className={styles.scroll}>
          <div className={styles.page} style={{ transform: `scale(${ZOOM_STEPS[zoom]})` }}>
            {page === 0 ? (
              <InvoicePage draft={draft} focus={focus} subtotal={subtotal} tax={tax} onAction={onAction} />
            ) : (
              <AttachmentPage draft={draft} />
            )}
          </div>
        </div>

        <div className={styles.thumbs}>
          {Array.from({ length: pages }).map((_, index) => (
            <button
              key={index}
              type="button"
              className={styles.thumb}
              aria-label={`Page ${index + 1}`}
              aria-current={index === page}
              data-press
              onClick={() => setPage(index)}
            >
              <span className={styles.thumbInner} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

type PageProps = {
  draft: InvoiceDraft;
  focus: NonNullable<InvoicePreviewProps["focus"]>;
  subtotal: number;
  tax: number;
  onAction: (message: string) => void;
};

function InvoicePage({ draft, focus, subtotal, tax, onAction }: PageProps) {
  return (
    <>
      <div className={styles.docHead} data-focus={focus === "details" || undefined}>
        <div>
          <p className={styles.docLabel}>Invoice No</p>
          <p className={styles.docValue}>{draft.number || "—"}</p>
        </div>
        <div>
          <p className={styles.docLabel}>Issued</p>
          <p className={styles.docValue}>{draft.invoiced || "—"}</p>
        </div>
        <div>
          <p className={styles.docLabel}>Due Date</p>
          <p className={styles.docValue}>{draft.due || "—"}</p>
        </div>
      </div>

      <div className={styles.parties}>
        <div className={styles.party}>
          <p className={styles.docLabel}>From</p>
          <Avatar size="md" initials={USER.initials} />
          <p className={styles.partyName}>{USER.name}</p>
          <p className={styles.docLine}>billing@bigtime.test</p>
          <p className={styles.docLine}>123 Business Ave</p>
          <p className={styles.docLine}>Chicago, IL 60601</p>
          <p className={styles.docLine}>USA</p>
        </div>
        <div className={styles.party} data-focus={focus === "recipient" || undefined}>
          <p className={styles.docLabel}>To</p>
          <Avatar size="md" initials={initials(draft.recipient)} color="#5b4ddb" />
          <p className={styles.partyName}>{draft.recipient || draft.client}</p>
          <p className={styles.docLine}>{draft.contact.split(" (")[0]}</p>
          {draft.address.split(", ").map((line, index) => (
            <p key={index} className={styles.docLine}>
              {line}
            </p>
          ))}
        </div>
      </div>

      <div className={styles.itemsBlock} data-focus={focus === "items" || undefined}>
        <table className={styles.docTable}>
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {draft.items.length === 0 ? (
              <tr>
                <td>
                  <span className={styles.ghost} style={{ width: "60%" }} />
                </td>
                <td>
                  <span className={styles.ghost} style={{ width: "40%" }} />
                </td>
                <td>
                  <span className={styles.ghost} style={{ width: "60%" }} />
                </td>
                <td>
                  <span className={styles.ghost} style={{ width: "70%" }} />
                </td>
              </tr>
            ) : (
              draft.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.item}
                    <span className={styles.docSub}>{item.project}</span>
                  </td>
                  <td>{item.qty}</td>
                  <td>{money(item.rate)}</td>
                  <td>{money(item.qty * item.rate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className={styles.totals}>
          <div className={styles.totalRow}>
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Tax (8%)</span>
            <span>{money(tax)}</span>
          </div>
          <div className={`${styles.totalRow} ${styles.totalDue}`}>
            <span>Total</span>
            <span className={styles.totalAmount}>{money(subtotal + tax)}</span>
          </div>
        </div>
      </div>

      {draft.note ? (
        <div className={styles.note}>
          <p className={styles.docLabel}>Note</p>
          <p className={styles.docLine}>{draft.note}</p>
        </div>
      ) : null}

      <div className={styles.docFoot}>
        <span>Powered by BigTime</span>
        <button type="button" className={styles.payLink} onClick={() => onAction("Payment options")}>
          Choose how you&rsquo;d like to pay
          <Icon name="arrow-right" size={12} />
        </button>
      </div>
    </>
  );
}

function AttachmentPage({ draft }: { draft: InvoiceDraft }) {
  return (
    <>
      <p className={styles.docLabel}>Attachments</p>
      <table className={styles.docTable}>
        <thead>
          <tr>
            <th>File</th>
            <th>Size</th>
          </tr>
        </thead>
        <tbody>
          {draft.attachments.map((file) => (
            <tr key={file.id}>
              <td>{file.name}</td>
              <td>{file.size}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function money(value: number) {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
