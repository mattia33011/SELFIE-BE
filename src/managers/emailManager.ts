// class unused
import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";
import { Personalization } from "mailersend/lib/modules/Email.module";

enum EmailTemplate {
  ACTIVATE_ACCOUNT = "z3m5jgrk3yzldpyo",
}

class EmailManager {
  private readonly mailersend: MailerSend;
  private readonly host: string;
  private readonly sender: Sender;
  constructor() {
    const apikey = process.env.EMAIL_API_KEY;
    const senderEmail = process.env.SENDER_EMAIL;
    const hostUrl = process.env.HOST_URL;

    if (!senderEmail) throw new Error("SENDER_EMAIL is not defined");
    if (!hostUrl) throw new Error("HOST_URL is not defined");
    if (!apikey) throw new Error("EMAIL_API_KEY is not defined");
    this.sender = new Sender(senderEmail);
    this.host = hostUrl;
    this.mailersend = new MailerSend({
      apiKey: apikey,
    });
  }
  async sendActivateAccount(recipient: Recipient, activationToken: string) {
    const personalization: Personalization = {
      email: recipient.email,
      data: {
        name: recipient.name,
        activateLink: this.host + "/activate?token=" + activationToken,
        selfieBaseUrl: this.host,
      },
    };
    return this.send(
      recipient,
      personalization,
      EmailTemplate.ACTIVATE_ACCOUNT
    );
  }

  private async send(
    recipient: Recipient,
    personalizations: Personalization,
    template: EmailTemplate
  ) {
    const emailParams = new EmailParams()
      .setFrom(this.sender)
      .setTo([recipient])
      .setSubject("Activate Account")
      .setTemplateId(template)
      .setPersonalization([personalizations]);
    return this.mailersend.email.send(emailParams);
  }
}

const emailManager = new EmailManager();
export default emailManager;
