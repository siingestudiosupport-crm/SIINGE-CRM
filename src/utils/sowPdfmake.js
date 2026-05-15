const buildDocDefinition = (data) => {
  const {
    date_1, date_2, date_3,
    full_address, business_name,
    client_name, client_title,
    deliverables, timeline, fees_payment,
    signatureImageBase64, studioSignatureBase64,
  } = data

  const styles = {
    title:        { fontSize: 16, bold: true, alignment: 'center', margin: [0, 0, 0, 14] },
    sectionHeader:{ fontSize: 12, bold: true, margin: [0, 14, 0, 5] },
    body:         { fontSize: 11, lineHeight: 1.5, margin: [0, 0, 0, 4] },
    fieldBlock:   { fontSize: 11, lineHeight: 1.5, margin: [0, 0, 0, 2] },
    sigLabel:     { fontSize: 11, bold: true, margin: [0, 0, 0, 10] },
    sigFieldLabel:{ fontSize: 9,  color: '#666666', margin: [0, 0, 0, 2] },
    sigFieldValue:{ fontSize: 11, margin: [0, 0, 0, 10] },
  }

  const hline = (w = 220) => ({
    canvas: [{ type: 'line', x1: 0, y1: 0, x2: w, y2: 0, lineWidth: 0.5 }],
    margin: [0, 0, 0, 8]
  })

  const multiline = (text) => {
    if (!text) return []
    return text.split('\n').map(l => ({ text: l || ' ', style: 'fieldBlock' }))
  }

  return {
    pageSize: 'LETTER',
    pageMargins: [54, 54, 54, 54],
    defaultStyle: { font: 'Roboto', fontSize: 11, lineHeight: 1.5 },
    styles,
    header: function(currentPage, pageCount) {
      return {
        text: `Page ${currentPage} of ${pageCount}`,
        alignment: 'right',
        fontSize: 10,
        color: '#666666',
        margin: [0, 10, 20, 0]
      }
    },
    content: [
      { text: 'SCOPE OF WORK AGREEMENT', style: 'title' },

      {
        text: [
          'This Scope of Work Agreement ("Agreement") is entered into as of ',
          { text: date_1 || '___________', decoration: 'underline' },
          ' by and between:',
        ],
        style: 'body', margin: [0, 0, 0, 6]
      },

      {
        text: [
          '("Client") with a principal place of business at ',
          { text: full_address || '___________', decoration: 'underline' },
          ' and SIINGE STUDIO, with a principal place of business at 7080 W. 20th Ave. #108 Lakewood, CO 80214 USA ("Studio").',
        ],
        style: 'body', margin: [0, 0, 0, 4]
      },

      {
        text: 'Client and Studio may be referred to collectively as the "Parties" and individually as a "Party."',
        style: 'body', margin: [0, 0, 0, 12]
      },

      { text: '1. SERVICES', style: 'sectionHeader' },
      { text: 'Service Provider agrees to perform professional services ("Services") in accordance with the Deliverables and Timeline set forth below. All Services will be performed in a commercially reasonable manner consistent with industry standards.', style: 'body' },

      { text: '2. DELIVERABLES', style: 'sectionHeader' },
      ...multiline(deliverables),

      { text: '3. TIMELINE', style: 'sectionHeader' },
      ...multiline(timeline),

      { text: '4. CLIENT RESPONSIBILITIES', style: 'sectionHeader' },
      { text: 'Client shall:', style: 'body' },
      { ul: ['Provide complete and accurate materials, information, and instructions necessary for performance of the Services', 'Respond to requests for approvals or feedback within two (2) business days', 'Designate a single authorized representative for all approvals'], fontSize: 11, lineHeight: 1.5, margin: [0, 0, 0, 4] },
      { text: 'Service Provider shall not be responsible for delays, defects, or additional costs arising from incomplete, inaccurate, or untimely Client inputs.', style: 'body' },

      { text: '5. FEES & PAYMENT', style: 'sectionHeader' },
      ...multiline(fees_payment),

      { text: '6. REVISIONS & SCOPE CONTROL', style: 'sectionHeader' },
      { text: 'Revisions are limited to modifications necessary to bring Deliverables into conformity with the specifications set forth in Section 2.', style: 'body' },
      { text: 'Any of the following shall constitute a change in scope:', style: 'body' },
      { ul: ['Changes to previously approved Deliverables', 'Additions to Deliverables', 'Changes in materials, direction, or specifications'], fontSize: 11, lineHeight: 1.5, margin: [0, 0, 0, 4] },
      { text: 'All scope changes must be agreed to in writing and may result in additional fees and timeline adjustments.', style: 'body' },

      { text: '7. THIRD-PARTY COSTS', style: 'sectionHeader' },
      { text: 'Client shall be responsible for all third-party costs, including but not limited to materials, sampling, production, shipping, and testing.', style: 'body' },
      { text: "Service Provider may procure third-party goods and services on Client's behalf. All such costs must be approved by Client in writing and paid in advance prior to procurement. Service Provider shall have no obligation to advance or cover any third-party costs.", style: 'body' },
      { text: 'All third-party costs are non-refundable once incurred.', style: 'body' },
      { text: 'Service Provider shall not be liable for the performance, quality, timelines, or outcomes of any third-party vendors.', style: 'body' },

      { text: '8. INTELLECTUAL PROPERTY', style: 'sectionHeader' },
      { text: 'Upon full payment, Client is granted ownership of the final Deliverables.', style: 'body' },
      { text: 'Service Provider retains ownership of all pre-existing materials, processes, methodologies, and any work product not included in the final Deliverables.', style: 'body' },

      { text: '9. PORTFOLIO & MARKETING USE', style: 'sectionHeader' },
      { text: 'Service Provider retains the right to document, display, and use the Deliverables and associated work product for portfolio, marketing, promotional, and editorial purposes, including but not limited to website, social media, presentations, and publications.', style: 'body' },
      { text: "Service Provider agrees not to disclose Client's confidential or proprietary business information.", style: 'body' },
      { text: 'If Client requires confidentiality prior to public release of the Deliverables, such restriction must be agreed to in writing in advance.', style: 'body' },

      { text: '10. CONFIDENTIALITY', style: 'sectionHeader' },
      { text: 'Each party agrees to maintain the confidentiality of all non-public, proprietary, or confidential information disclosed by the other party ("Confidential Information").', style: 'body' },
      { text: 'Confidential Information includes, but is not limited to, business plans, product designs, technical information, pricing, and supplier information.', style: 'body' },
      { text: 'The receiving party shall not disclose or use such information except as necessary to perform under this Agreement without prior written consent.', style: 'body' },
      { text: 'This obligation shall survive termination of this Agreement.', style: 'body' },

      { text: '11. LIMITATION OF LIABILITY', style: 'sectionHeader' },
      { text: 'To the maximum extent permitted by law:', style: 'body' },
      { ul: ["Service Provider's total cumulative liability shall not exceed the total fees paid under this SOW", 'Service Provider shall not be liable for any indirect, incidental, special, or consequential damages'], fontSize: 11, lineHeight: 1.5, margin: [0, 0, 0, 4] },

      { text: '12. TERMINATION', style: 'sectionHeader' },
      { text: 'Either party may terminate this SOW upon fourteen (14) days written notice.', style: 'body' },
      { text: 'Client shall remain responsible for payment for all Services performed and costs incurred up to the effective date of termination.', style: 'body' },
      { text: 'If Client terminates this SOW, all amounts paid are non-refundable, and any outstanding balances for Services performed or costs incurred shall become immediately due.', style: 'body' },
      { text: "If Service Provider terminates this SOW, Client shall be entitled to a refund of any prepaid fees for Services not yet performed, less (a) the value of Services already completed, and (b) any non-refundable third-party costs incurred.", style: 'body' },
      { text: 'The value of Services performed shall be determined based on the proportion of work completed relative to the Deliverables or, where applicable, on a time and materials basis.', style: 'body' },

      { text: '13. INDEPENDENT CONTRACTOR', style: 'sectionHeader' },
      { text: 'Service Provider is an independent contractor and not an employee, partner, or joint venturer of Client.', style: 'body' },
      { text: 'Service Provider may engage employees, subcontractors, or third-party service providers, including manufacturers, to perform all or part of the Services. Service Provider shall remain responsible for coordination of such parties.', style: 'body' },

      { text: '14. FORCE MAJEURE', style: 'sectionHeader' },
      { text: 'Service Provider shall not be liable for any delay or failure to perform resulting from causes beyond its reasonable control, including but not limited to supply chain disruptions, material shortages, transportation delays, or failures of third-party vendors.', style: 'body' },

      { text: '15. ASSIGNMENT', style: 'sectionHeader' },
      { text: 'Client may not assign or transfer this Agreement without the prior written consent of Service Provider.', style: 'body' },

      { text: '16. ENTIRE AGREEMENT', style: 'sectionHeader' },
      { text: 'This SOW constitutes the entire agreement between the parties and supersedes all prior communications or agreements.', style: 'body' },

      { text: '17. AMENDMENTS', style: 'sectionHeader' },
      { text: 'This SOW may be amended only by a written document signed by both parties.', style: 'body' },

      { text: '18. GOVERNING LAW', style: 'sectionHeader' },
      { text: 'This Agreement shall be governed by the laws of the State of Colorado.', style: 'body', margin: [0, 0, 0, 20] },

      { text: 'SIGNATURES', style: 'sectionHeader', margin: [0, 0, 0, 6] },
      { text: 'IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date written above.', style: 'body', margin: [0, 0, 0, 16] },

      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'CLIENT', style: 'sigLabel' },
              { text: 'BUSINESS NAME', style: 'sigFieldLabel' },
              { text: business_name || ' ', style: 'sigFieldValue' },
              hline(),
              { text: 'CLIENT NAME:', style: 'sigFieldLabel' },
              { text: client_name || ' ', style: 'sigFieldValue' },
              hline(),
              { text: 'TITLE:', style: 'sigFieldLabel' },
              { text: client_title || ' ', style: 'sigFieldValue' },
              hline(),
              { text: 'SIGNATURE:', style: 'sigFieldLabel' },
              signatureImageBase64
                ? { image: `data:image/png;base64,${signatureImageBase64}`, width: 110, height: 45, margin: [0, 4, 0, 4] }
                : { text: ' ', margin: [0, 0, 0, 45] },
              hline(),
              { text: 'DATE:', style: 'sigFieldLabel' },
              { text: date_2 || ' ', style: 'sigFieldValue' },
              hline(),
            ]
          },
          {
            width: '50%',
            stack: [
              { text: 'STUDIO', style: 'sigLabel' },
              { text: 'SIINGE STUDIO', fontSize: 11, margin: [0, 0, 0, 2] },
              { text: 'SIERRA WHITE, FOUNDER', fontSize: 11, margin: [0, 0, 0, 12] },
              { text: 'SIGNATURE:', style: 'sigFieldLabel' },
              studioSignatureBase64
                ? { image: `data:image/png;base64,${studioSignatureBase64}`, width: 110, height: 45, margin: [0, 4, 0, 4] }
                : { text: ' ', margin: [0, 0, 0, 45] },
              hline(),
              { text: 'DATE:', style: 'sigFieldLabel' },
              { text: date_3 || ' ', style: 'sigFieldValue' },
              hline(),
            ]
          }
        ],
        columnGap: 30
      }
    ]
  }
}

export const getSOWPdfBlob = async (data) => {
  try {
    const pdfMake = (await import('pdfmake/build/pdfmake')).default
    const pdfFonts = (await import('pdfmake/build/vfs_fonts')).default
    pdfMake.vfs = pdfFonts
    const docDef = buildDocDefinition(data)
    const pdf = pdfMake.createPdf(docDef)
    const blob = await pdf.getBlob()
    return blob
  } catch (err) {
    console.error('[getSOWPdfBlob] Error:', err)
    throw err
  }
}

export const getSOWPdfDataUrl = async (data) => {
  try {
    const pdfMake = (await import('pdfmake/build/pdfmake')).default
    const pdfFonts = (await import('pdfmake/build/vfs_fonts')).default
    pdfMake.vfs = pdfFonts
    const docDef = buildDocDefinition(data)
    const pdf = pdfMake.createPdf(docDef)
    const url = await pdf.getDataUrl()
    return url
  } catch (err) {
    console.error('[getSOWPdfDataUrl] Error:', err)
    throw err
  }
}
