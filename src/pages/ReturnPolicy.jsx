import { useState } from 'react'
import './ReturnPolicy.css'

const returnStatuses = ['Return Requested', 'Under Review', 'Approved', 'Refunded']

function ReturnPolicy() {
  const [request, setRequest] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [proofName, setProofName] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    const formData = new FormData(event.currentTarget)
    const orderNumber = String(formData.get('orderNumber') ?? '').trim()
    const reason = String(formData.get('reason') ?? '')
    const proof = formData.get('proof')

    if (!orderNumber || !reason) {
      setErrorMessage('Enter your order number and choose a return reason.')
      return
    }
    if (proof instanceof File && proof.size > 0 && !proof.type.startsWith('image/')) {
      setErrorMessage('Choose an image file as your proof.')
      return
    }
    if (proof instanceof File && proof.size > 5 * 1024 * 1024) {
      setErrorMessage('The image must be 5 MB or smaller.')
      return
    }

    setRequest({
      orderNumber,
      reason,
      proofName: proof instanceof File && proof.size > 0 ? proof.name : '',
      status: returnStatuses[0]
    })
    event.currentTarget.reset()
    setProofName('')
  }

  function handleProofChange(event) {
    setErrorMessage('')
    const file = event.target.files?.[0]
    if (!file) {
      setProofName('')
      return
    }
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Choose an image file as your proof.')
      event.target.value = ''
      setProofName('')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('The image must be 5 MB or smaller.')
      event.target.value = ''
      setProofName('')
      return
    }
    setProofName(file.name)
  }

  return (
    <main className="return-policy-page">
      <div className="policy-container">
        <header className="policy-heading">
          <p className="eyebrow">Here when you need us</p>
          <h1>Return &amp; Refund <em>Policy</em></h1>
          <p>We want every handmade find to feel just right. If there’s a problem with your order, here’s how we can help.</p>
        </header>

        <section className="policy-card">
          <h2>Return Eligibility</h2>
          <p>You can request a return within 7 days of delivery if:</p>
          <ul>
            <li>The product arrives damaged</li>
            <li>The product is defective</li>
            <li>The wrong product was delivered</li>
            <li>The product is significantly different from its description</li>
          </ul>
        </section>

        <section className="policy-card">
          <h2>Non-Returnable Products</h2>
          <p>Returns are generally not accepted for:</p>
          <ul>
            <li>Personalized or custom-made products</li>
            <li>Products damaged through customer misuse</li>
            <li>Products returned after the 7-day return period</li>
            <li>Products that do not meet the required return condition</li>
          </ul>
        </section>

        <section className="policy-card">
          <h2>How to Request a Return</h2>
          <ol>
            <li>Go to My Orders</li>
            <li>Select the relevant order</li>
            <li>Select “Request Return”</li>
            <li>Choose the reason for return</li>
            <li>Submit the request</li>
          </ol>
          <p className="policy-note">My Orders and order-linked return requests are not connected in this demo, so you can submit a sample request below.</p>
        </section>

        <section className="policy-card">
          <h2>Refunds</h2>
          <p>Once a return is approved, the refund will be processed according to the payment method used.</p>
          <p>For this academic project, refund status is represented by these steps:</p>
          <div className="refund-statuses">
            {returnStatuses.map((status, index) => (
              <span className="refund-status" key={status}>
                <span className="refund-status-number">{index + 1}</span>
                {status}
              </span>
            ))}
          </div>
        </section>

        <section className="policy-card return-request-card">
          <h2>Report a Problem</h2>
          <p>Submit a sample return request. If your product arrived damaged, you can optionally attach an image as proof.</p>
          <form className="return-request-form" onSubmit={handleSubmit} noValidate>
            <label>
              Order Number
              <input name="orderNumber" type="text" placeholder="For example, 1001" required />
            </label>
            <label>
              Reason for return
              <select name="reason" defaultValue="" required>
                <option value="" disabled>Select a reason</option>
                <option value="Damaged product">Damaged product</option>
                <option value="Defective product">Defective product</option>
                <option value="Wrong product delivered">Wrong product delivered</option>
                <option value="Different from description">Significantly different from description</option>
              </select>
            </label>
            <label>
              Image proof <span className="optional-label">(optional, image up to 5 MB)</span>
              <input name="proof" type="file" accept="image/*" onChange={handleProofChange} />
            </label>
            {proofName && <p className="proof-name" role="status">Selected image: {proofName}</p>}
            {errorMessage && <p className="return-form-error" role="alert">{errorMessage}</p>}
            <button className="button button-dark" type="submit">Submit return request <span aria-hidden="true">↗</span></button>
          </form>
          {request && (
            <div className="return-request-result" role="status">
              <p className="eyebrow">Sample request submitted</p>
              <p>Order #{request.orderNumber} · {request.reason}</p>
              {request.proofName && <small>Image proof attached: {request.proofName}</small>}
              <strong>{request.status}</strong>
              <small>Demo status only; requests are not saved to a database.</small>
            </div>
          )}
        </section>

        <section className="policy-card policy-contact">
          <h2>Damaged Products &amp; Contact</h2>
          <p>If your product arrived damaged, select “Damaged product” above and attach an image if you can. For questions about a return or refund, contact the marketplace support team.</p>
        </section>
      </div>
    </main>
  )
}

export default ReturnPolicy
