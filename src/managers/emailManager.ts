import Nodemailer, { Transporter } from "nodemailer";
import templateRepository from "../repositories/templateRepository";

enum EmailTemplate {
  "SEND_MESSAGE" = "SEND_MESSAGE",
  "prova" = "prova"
}

class EmailManager {
  private readonly sender = '"Team Selfie" <selfieproject2025@gmail.com>'
  private readonly transport: Transporter

  constructor() {
    this.transport = Nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: "selfieproject2025@gmail.com",
        pass: "ydgj lecu mjua bgaj",
      },
    });


  }
  async sendMessage(recipient: string, name: string, message: string) {
    const variables = [
      {name: "accountName", value: name},
      {name: "message", value: message}
    ];

    return this.send(
      [recipient],
      "Selfie - New message",
      variables,
      EmailTemplate.SEND_MESSAGE
    );
  }

  private async send(
    recipients: string[],
    subject: string,
    variables: Variable[],
    template: EmailTemplate
  ) {

    let templateHtml = (await templateRepository.getTemplateByName(template.toString())).content

    variables.forEach((it) => {
      templateHtml = templateHtml.replace(`{{${it.name}}}`, it.value)
    })

    return this.transport.sendMail({
      from: this.sender,
      to: recipientsToString(recipients),
      subject: subject,
      html: templateHtml
    })

  }
}
type Variable = {name: string, value: string}

const recipientsToString = (emails: string[]) => emails.join(", ")

const emailManager = new EmailManager();
export default emailManager;

