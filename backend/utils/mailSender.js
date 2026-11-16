const mailSender = async (email, title, body) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is not set")
    }
    if (!process.env.MAIL_USER) {
      throw new Error("MAIL_USER is not set")
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "StudyNotion",
          email: process.env.MAIL_USER,
        },
        to: [{ email }],
        subject: title,
        htmlContent: body,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      console.log("Brevo error:", data)
      throw new Error(data?.message || "Failed to send email")
    }

    console.log("Email sent Successfully!", data)
    return data
  } catch (error) {
    console.log(error.message)
    throw new Error(error.message || "Failed to send email")
  }
}

module.exports = mailSender
