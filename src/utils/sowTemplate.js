// SOW HTML Template matching the original PDF exactly
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
    signatureImageBase64,
    studioSignatureBase64,
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
      font-family: 'Times New Roman', serif;
      font-size: 12px;
      line-height: 1.4;
      color: #000;
      background: white;
    }

    .document {
      width: 7in;
      margin: 0 auto;
      background: white;
    }

    h1 {
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 14px;
      margin-top: 0;
      letter-spacing: 0.04em;
    }

    h2 {
      font-size: 14px;
      font-weight: bold;
      margin-top: 16px;
      margin-bottom: 8px;
      padding: 0;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      page-break-after: avoid;
    }

    .section {
      page-break-inside: avoid;
      break-inside: avoid;
      margin-bottom: 4px;
    }

    .page-break-before {
      page-break-before: always;
      break-before: page;
    }

    p {
      margin-bottom: 5px;
      margin-top: 0;
      line-height: 1.4;
      font-size: 12px;
      page-break-inside: avoid;
      break-inside: avoid;
      orphans: 3;
      widows: 3;
    }

    ul {
      margin-left: 22px;
      margin-bottom: 6px;
      margin-top: 4px;
      padding: 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    li {
      margin-bottom: 4px;
      font-size: 12px;
      line-height: 1.4;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .intro-text {
      margin-bottom: 6px;
    }

    .form-field-block {
      margin: 6px 0 10px 0;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-size: 12px;
      line-height: 1.4;
    }

    .signature-block {
      margin-top: 18px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      page-break-inside: avoid;
    }

    .sig-row {
      margin-bottom: 0;
    }

    .sig-label {
      font-weight: bold;
      margin-bottom: 12px;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .sig-field-label {
      font-size: 10px;
      margin-bottom: 2px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #666;
    }

    .sig-field-value {
      min-height: 14px;
      margin-bottom: 12px;
      border-bottom: 1px solid #000;
      padding-bottom: 1px;
      font-size: 12px;
    }

    .sig-line {
      margin-bottom: 12px;
      border-bottom: 1px solid #000;
      min-height: 28px;
      padding-bottom: 1px;
    }

    .sig-image {
      max-height: 50px;
      max-width: 120px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>

<div class="document">

  <h1>SCOPE OF WORK AGREEMENT</h1>

  <p class="intro-text">This Scope of Work Agreement ("Agreement") is entered into as of <u>${date_1 || '___________'}</u> by and between:</p>

  <p style="margin: 2px 0 6px 0;">("Client") with a principal place of business at <u>${full_address || '___________'}</u> and SIINGE STUDIO, with a principal place of business at 7080 W. 20th Ave. #108 Lakewood, CO 80214 USA ("Studio").</p>

  <p style="margin-top: 6px;">Client and Studio may be referred to collectively as the "Parties" and individually as a "Party."</p>

  <div class="section">
    <h2>1. Services</h2>
    <p>Service Provider agrees to perform professional services ("Services") in accordance with the Deliverables and Timeline set forth below. All Services will be performed in a commercially reasonable manner consistent with industry standards.</p>
  </div>

  <div class="section">
    <h2>2. Deliverables</h2>
    <div class="form-field-block">${deliverables || ''}</div>
  </div>

  <div class="section">
    <h2>3. Timeline</h2>
    <div class="form-field-block">${timeline || ''}</div>
  </div>

  <div class="section">
    <h2>4. Client Responsibilities</h2>
    <p>Client shall:</p>
    <ul>
      <li>Provide complete and accurate materials, information, and instructions necessary for performance of the Services</li>
      <li>Respond to requests for approvals or feedback within two (2) business days</li>
      <li>Designate a single authorized representative for all approvals</li>
    </ul>
    <p>Service Provider shall not be responsible for delays, defects, or additional costs arising from incomplete, inaccurate, or untimely Client inputs.</p>
  </div>

  <div class="section">
    <h2>5. Fees &amp; Payment</h2>
    <div class="form-field-block">${fees_payment || ''}</div>
  </div>

  <div class="section">
    <h2>6. Revisions &amp; Scope Control</h2>
    <p>Revisions are limited to modifications necessary to bring Deliverables into conformity with the specifications set forth in Section 2.</p>
    <p>Any of the following shall constitute a change in scope:</p>
    <ul>
      <li>Changes to previously approved Deliverables</li>
      <li>Additions to Deliverables</li>
      <li>Changes in materials, direction, or specifications</li>
    </ul>
    <p>All scope changes must be agreed to in writing and may result in additional fees and timeline adjustments.</p>
  </div>

  <div class="section page-break-before">
    <h2>7. Third-Party Costs</h2>
    <p>Client shall be responsible for all third-party costs, including but not limited to materials, sampling, production, shipping, and testing.</p>
    <p>Service Provider may procure third-party goods and services on Client's behalf. All such costs must be approved by Client in writing and paid in advance prior to procurement. Service Provider shall have no obligation to advance or cover any third-party costs.</p>
    <p>All third-party costs are non-refundable once incurred.</p>
    <p>Service Provider shall not be liable for the performance, quality, timelines, or outcomes of any third-party vendors.</p>
  </div>

  <div class="section">
    <h2>8. Intellectual Property</h2>
    <p>Upon full payment, Client is granted ownership of the final Deliverables.</p>
    <p>Service Provider retains ownership of all pre-existing materials, processes, methodologies, and any work product not included in the final Deliverables.</p>
  </div>

  <div class="section">
    <h2>9. Portfolio &amp; Marketing Use</h2>
    <p>Service Provider retains the right to document, display, and use the Deliverables and associated work product for portfolio, marketing, promotional, and editorial purposes, including but not limited to website, social media, presentations, and publications.</p>
    <p>Service Provider agrees not to disclose Client's confidential or proprietary business information.</p>
    <p>If Client requires confidentiality prior to public release of the Deliverables, such restriction must be agreed to in writing in advance.</p>
  </div>

  <div class="section">
    <h2>10. Confidentiality</h2>
    <p>Each party agrees to maintain the confidentiality of all non-public, proprietary, or confidential information disclosed by the other party ("Confidential Information").</p>
    <p>Confidential Information includes, but is not limited to, business plans, product designs, technical information, pricing, and supplier information.</p>
    <p>The receiving party shall not disclose or use such information except as necessary to perform under this Agreement without prior written consent.</p>
    <p>This obligation shall survive termination of this Agreement.</p>
  </div>

  <div class="section page-break-before">
    <h2>11. Limitation of Liability</h2>
    <p>To the maximum extent permitted by law:</p>
    <ul>
      <li>Service Provider's total cumulative liability shall not exceed the total fees paid under this SOW</li>
      <li>Service Provider shall not be liable for any indirect, incidental, special, or consequential damages</li>
    </ul>
  </div>

  <div class="section">
    <h2>12. Termination</h2>
    <p>Either party may terminate this SOW upon fourteen (14) days written notice.</p>
    <p>Client shall remain responsible for payment for all Services performed and costs incurred up to the effective date of termination.</p>
    <p>If Client terminates this SOW, all amounts paid are non-refundable, and any outstanding balances for Services performed or costs incurred shall become immediately due.</p>
    <p>If Service Provider terminates this SOW, Client shall be entitled to a refund of any prepaid fees for Services not yet performed, less (a) the value of Services already completed, and (b) any non-refundable third-party costs incurred.</p>
    <p>The value of Services performed shall be determined based on the proportion of work completed relative to the Deliverables or, where applicable, on a time and materials basis.</p>
  </div>

  <div class="section">
    <h2>13. Independent Contractor</h2>
    <p>Service Provider is an independent contractor and not an employee, partner, or joint venturer of Client.</p>
    <p>Service Provider may engage employees, subcontractors, or third-party service providers, including manufacturers, to perform all or part of the Services. Service Provider shall remain responsible for coordination of such parties.</p>
  </div>

  <div class="section">
    <h2>14. Force Majeure</h2>
    <p>Service Provider shall not be liable for any delay or failure to perform resulting from causes beyond its reasonable control, including but not limited to supply chain disruptions, material shortages, transportation delays, or failures of third-party vendors.</p>
  </div>

  <div class="section page-break-before">
    <h2>15. Assignment</h2>
    <p>Client may not assign or transfer this Agreement without the prior written consent of Service Provider.</p>
  </div>

  <div class="section">
    <h2>16. Entire Agreement</h2>
    <p>This SOW constitutes the entire agreement between the parties and supersedes all prior communications or agreements.</p>
  </div>

  <div class="section">
    <h2>17. Amendments</h2>
    <p>This SOW may be amended only by a written document signed by both parties.</p>
  </div>

  <div class="section">
    <h2>18. Governing Law</h2>
    <p>This Agreement shall be governed by the laws of the State of Colorado.</p>
  </div>

  <div class="section">
    <h2 style="margin-top: 20px;">Signatures</h2>
    <p>IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date written above.</p>

    <div class="signature-block">
      <div class="sig-row">
        <p class="sig-label">CLIENT</p>

        <p class="sig-field-label">Business Name</p>
        <p class="sig-field-value">${business_name || ''}</p>

        <p class="sig-field-label">Client Name:</p>
        <p class="sig-field-value">${client_name || ''}</p>

        <p class="sig-field-label">Title:</p>
        <p class="sig-field-value">${client_title || ''}</p>

        <p class="sig-field-label">Signature:</p>
        <div class="sig-line">
          ${signatureImageBase64 ? `<img src="data:image/png;base64,${signatureImageBase64}" class="sig-image" />` : ''}
        </div>

        <p class="sig-field-label">Date:</p>
        <p class="sig-field-value">${date_2 || ''}</p>
      </div>

      <div class="sig-row">
        <p class="sig-label">STUDIO</p>

        <p class="sig-label" style="font-weight: normal; font-size: 12px;">SIINGE STUDIO</p>
        <p class="sig-label" style="font-weight: normal; font-size: 12px;">Sierra White, Founder</p>

        <p class="sig-field-label" style="margin-top: 8px;">Signature:</p>
        <div class="sig-line">
          ${studioSignatureBase64 ? `<img src="data:image/png;base64,${studioSignatureBase64}" class="sig-image" />` : ''}
        </div>

        <p class="sig-field-label">Date:</p>
        <p class="sig-field-value">${date_3 || ''}</p>
      </div>
    </div>
  </div>

</div>

</body>
</html>
  `
}
