// SOW HTML Template for dynamic generation
export const generateSOWHTML = (data) => {
  const {
    date_1,
    date_2,
    date_3,
    company_name,
    full_address,
    business_name,
    client_name,
    client_title,
    deliverables,
    timeline,
    fees_payment,
    signatureImageBase64,  // client's signature from canvas
    studioSignatureBase64, // studio's pre-loaded signature
  } = data

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Scope of Work Agreement</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Garamond', 'Georgia', serif;
      font-size: 11.5px;
      line-height: 1.7;
      color: #1a1a1a;
      background: white;
    }

    .page {
      width: 8.5in;
      min-height: 11in;
      margin: 0 auto;
      padding: 0.85in 0.9in;
      background: white;
      position: relative;
    }

    .page:last-child {
      min-height: 0;
    }

    .page-number {
      position: absolute;
      top: 0.4in;
      right: 0.9in;
      font-size: 9px;
      color: #999;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    h1 {
      font-size: 22px;
      font-weight: bold;
      text-align: center;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .doc-subtitle {
      text-align: center;
      font-size: 11px;
      color: #888;
      letter-spacing: 0.04em;
      margin-bottom: 28px;
    }

    h2 {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: #555;
      margin-top: 24px;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #ddd;
    }

    p {
      margin-bottom: 8px;
      text-align: justify;
      font-size: 11.5px;
      line-height: 1.7;
    }

    ul {
      margin-left: 18px;
      margin-bottom: 10px;
    }

    li {
      margin-bottom: 5px;
      font-size: 11.5px;
      line-height: 1.6;
    }

    .form-field-inline {
      display: inline-block;
      min-width: 120px;
      margin: 0 3px;
      padding: 0 3px 1px;
      vertical-align: bottom;
    }

    .form-field-block {
      padding: 6px 0 8px;
      margin: 6px 0 12px;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-size: 11.5px;
      line-height: 1.7;
      min-height: 1.8em;
    }

    .form-field-block.large {
      border: none;
      padding: 0;
      margin: 8px 0 16px;
      background: transparent;
      min-height: 60px;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .intro-block {
      margin: 18px 0;
      padding: 14px 18px;
    }

    .intro-block p {
      margin-bottom: 6px;
    }
    .intro-block p:last-child { margin-bottom: 0; }

    .party-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: #888;
      margin-bottom: 2px;
    }

    .section-body {
      margin-bottom: 4px;
    }

    .signature-section {
      margin-top: 36px;
    }

    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 24px;
    }

    .sig-block-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: #555;
      margin-bottom: 14px;
    }

    .sig-field-label {
      font-size: 9px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-top: 10px;
      margin-bottom: 2px;
    }

    .sig-value {
      min-height: 1.4em;
      padding-bottom: 2px;
      font-size: 11.5px;
    }

    .sig-canvas-box {
      border-bottom: 1px solid #333;
      height: 70px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding-bottom: 4px;
    }

    .sig-canvas-box img {
      max-height: 66px;
      max-width: 100%;
      object-fit: contain;
    }

    @media print {
      body { margin: 0; }
      .page { margin: 0; }
    }
  </style>
</head>
<body>

<!-- PAGE 1 -->
<div class="page">
  <div class="page-number">Page 1 of 5</div>

  <h1>Scope of Work Agreement</h1>
  <p class="doc-subtitle">Effective Date: ${date_1 || '___________'}</p>

  <p>This Scope of Work Agreement ("Agreement") is entered into as of <strong>${date_1 || '___________'}</strong> by and between:</p>

  <div class="intro-block">
    <p class="party-label">Client</p>
    <p><strong>${client_name || '&nbsp;'}</strong>${client_title ? `, ${client_title}` : ''}</p>
    ${company_name ? `<p>${company_name}</p>` : ''}
    ${full_address ? `<p>${full_address}</p>` : ''}
  </div>

  <p style="margin: 12px 0;">and</p>

  <div class="intro-block">
    <p class="party-label">Studio</p>
    <p><strong>SIINGE STUDIO</strong></p>
    <p>7080 W. 20th Ave. #108, Lakewood, CO 80214 USA</p>
  </div>

  <p style="margin-top: 14px;">Client and Studio may be referred to collectively as the "Parties" and individually as a "Party."</p>

  <h2>1. Services</h2>
  <p>Service Provider agrees to perform professional services ("Services") in accordance with the Deliverables and Timeline set forth below. All Services will be performed in a commercially reasonable manner consistent with industry standards.</p>

  <h2>2. Deliverables</h2>
  <div class="form-field-block large">${deliverables || ''}</div>

  <h2>3. Timeline</h2>
  <div class="form-field-block large">${timeline || ''}</div>
</div>

<!-- PAGE 2 -->
<div class="page">
  <div class="page-number">Page 2 of 5</div>

  <h2>4. Client Responsibilities</h2>
  <p>Client shall:</p>
  <ul>
    <li>Provide complete and accurate materials, information, and instructions necessary for performance of the Services</li>
    <li>Respond to requests for approvals or feedback within two (2) business days</li>
    <li>Designate a single authorized representative for all approvals</li>
  </ul>
  <p>Service Provider shall not be responsible for delays, defects, or additional costs arising from incomplete, inaccurate, or untimely Client inputs.</p>

  <h2>5. Fees & Payment</h2>
  <div class="form-field-block large">${fees_payment || ''}</div>

  <h2>6. Revisions & Scope Control</h2>
  <p>Revisions are limited to modifications necessary to bring Deliverables into conformity with the specifications set forth in Section 2.</p>
  <p>Any of the following shall constitute a change in scope:</p>
  <ul>
    <li>Changes to previously approved Deliverables</li>
    <li>Additions to Deliverables</li>
    <li>Changes in materials, direction, or specifications</li>
  </ul>
  <p>All scope changes must be agreed to in writing and may result in additional fees and timeline adjustments.</p>
</div>

<!-- PAGE 3 -->
<div class="page">
  <div class="page-number">Page 3 of 5</div>

  <h2>7. Third-Party Costs</h2>
  <p>Client shall be responsible for all third-party costs, including but not limited to materials, sampling, production, shipping, and testing.</p>
  <p>Service Provider may procure third-party goods and services on Client's behalf. All such costs must be approved by Client in writing and paid in advance prior to procurement. Service Provider shall have no obligation to advance or cover any third-party costs.</p>
  <p>All third-party costs are non-refundable once incurred.</p>
  <p>Service Provider shall not be liable for the performance, quality, timelines, or outcomes of any third-party vendors.</p>

  <h2>8. Intellectual Property</h2>
  <p>Upon full payment, Client is granted ownership of the final Deliverables.</p>
  <p>Service Provider retains ownership of all pre-existing materials, processes, methodologies, and any work product not included in the final Deliverables.</p>

  <h2>9. Portfolio & Marketing Use</h2>
  <p>Service Provider retains the right to document, display, and use the Deliverables and associated work product for portfolio, marketing, promotional, and editorial purposes, including but not limited to website, social media, presentations, and publications.</p>
  <p>Service Provider agrees not to disclose Client's confidential or proprietary business information.</p>
  <p>If Client requires confidentiality prior to public release of the Deliverables, such restriction must be agreed to in writing in advance.</p>

  <h2>10. Confidentiality</h2>
  <p>Each party agrees to maintain the confidentiality of all non-public, proprietary, or confidential information disclosed by the other party ("Confidential Information").</p>
  <p>Confidential Information includes, but is not limited to, business plans, product designs, technical information, pricing, and supplier information.</p>
</div>

<!-- PAGE 4 -->
<div class="page">
  <div class="page-number">Page 4 of 5</div>

  <p>The receiving party shall not disclose or use such information except as necessary to perform under this Agreement without prior written consent.</p>
  <p>This obligation shall survive termination of this Agreement.</p>

  <h2>11. Limitation of Liability</h2>
  <p>To the maximum extent permitted by law:</p>
  <ul>
    <li>Service Provider's total cumulative liability shall not exceed the total fees paid under this SOW</li>
    <li>Service Provider shall not be liable for any indirect, incidental, special, or consequential damages</li>
  </ul>

  <h2>12. Termination</h2>
  <p>Either party may terminate this SOW upon fourteen (14) days written notice.</p>
  <p>Client shall remain responsible for payment for all Services performed and costs incurred up to the effective date of termination.</p>
  <p>If Client terminates this SOW, all amounts paid are non-refundable, and any outstanding balances for Services performed or costs incurred shall become immediately due.</p>
  <p>If Service Provider terminates this SOW, Client shall be entitled to a refund of any prepaid fees for Services not yet performed, less (a) the value of Services already completed, and (b) any non-refundable third-party costs incurred.</p>
  <p>The value of Services performed shall be determined based on the proportion of work completed relative to the Deliverables or, where applicable, on a time and materials basis.</p>

  <h2>13. Independent Contractor</h2>
  <p>Service Provider is an independent contractor and not an employee, partner, or joint venturer of Client.</p>
  <p>Service Provider may engage employees, subcontractors, or third-party service providers, including manufacturers, to perform all or part of the Services. Service Provider shall remain responsible for coordination of such parties.</p>
</div>

<!-- PAGE 5 -->
<div class="page">
  <div class="page-number">Page 5 of 5</div>

  <h2>14. Force Majeure</h2>
  <p>Service Provider shall not be liable for any delay or failure to perform resulting from causes beyond its reasonable control, including but not limited to supply chain disruptions, material shortages, transportation delays, or failures of third-party vendors.</p>

  <h2>15. Assignment</h2>
  <p>Client may not assign or transfer this Agreement without the prior written consent of Service Provider.</p>

  <h2>16. Entire Agreement</h2>
  <p>This SOW constitutes the entire agreement between the parties and supersedes all prior communications or agreements.</p>

  <h2>17. Amendments</h2>
  <p>This SOW may be amended only by a written document signed by both parties.</p>

  <h2>18. Governing Law</h2>
  <p>This Agreement shall be governed by the laws of the State of Colorado.</p>

  <div class="signature-section">
    <h2>Signatures</h2>
    <p>IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date written above.</p>

    <div class="signature-grid">

      <!-- CLIENT SIGNATURE -->
      <div>
        <p class="sig-block-label">Client</p>

        <p class="sig-field-label">Business Name</p>
        <p class="sig-value">${business_name || '&nbsp;'}</p>

        <p class="sig-field-label">Full Name</p>
        <p class="sig-value">${client_name || '&nbsp;'}</p>

        <p class="sig-field-label">Title</p>
        <p class="sig-value">${client_title || '&nbsp;'}</p>

        <p class="sig-field-label">Signature</p>
        <div class="sig-canvas-box">
          ${signatureImageBase64 ? `<img src="data:image/png;base64,${signatureImageBase64}" />` : ''}
        </div>

        <p class="sig-field-label">Date</p>
        <p class="sig-value">${date_2 || '&nbsp;'}</p>
      </div>

      <!-- STUDIO SIGNATURE -->
      <div>
        <p class="sig-block-label">Studio</p>

        <p class="sig-field-label">Business Name</p>
        <p class="sig-value">SIINGE STUDIO</p>

        <p class="sig-field-label">Full Name</p>
        <p class="sig-value">Sierra White</p>

        <p class="sig-field-label">Title</p>
        <p class="sig-value">Founder</p>

        <p class="sig-field-label">Signature</p>
        <div class="sig-canvas-box">
          ${studioSignatureBase64 ? `<img src="data:image/png;base64,${studioSignatureBase64}" />` : ''}
        </div>

        <p class="sig-field-label">Date</p>
        <p class="sig-value">${date_3 || '&nbsp;'}</p>
      </div>

    </div>
  </div>
</div>

</body>
</html>
  `
}
