import { MailDataRequired } from "@sendgrid/mail";
import sendgridMailClient from "./sendgridMailClient";
import { MAIL_FROM } from "../env/public";
import { APP_URL } from "../secrets";
import { User } from "@prisma/client";

// todo: these functions should process the sendgrid response and return errors if relevant
// todo: reduce the amount of data we load to create the mail service & remove redundant fn params (like email)

// Email templates are stored in here for now because it's better than running some hbs file loader.
// ENG-55 tracks the work to move to sendgrid

/**
 * Instances of the mail service are initialized with a user.
 * When preparing a deeplink, we first check to see if the user has completed account setup. If not, we direct them to the setup
 * page and then redirect to the original deeplink after setup is complete.
 */
export class MailService {
  userSetupPath = "user/setup";
  from: Pick<MailDataRequired, "from"> = {
    from: {
      email: MAIL_FROM,
      name: "Rizome",
    },
  };

  email: string;
  firstName: string | null;
  lastName: string | null;
  supabaseId: string | null;

  constructor(user: Pick<User, "email" | "firstName" | "lastName" | "supabaseId">) {
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.supabaseId = user.supabaseId;
  }

  private deeplink(token_hash: string, path: string): string {
    const setupCompleteRequirements = [
      this.firstName !== null && this.firstName.length > 0,
      this.lastName !== null && this.lastName.length > 0,
      this.supabaseId !== null && this.supabaseId.length > 0,
    ];
    const setupComplete = setupCompleteRequirements.reduce((acc, c) => acc && c, true);
    // Double slashes are sometimes processed correctly by browsers, but better safe than sorry
    const pathStartIndex = path.substring(0, 1) === "/" ? 1 : 0;
    if (setupComplete) {
      return `${APP_URL}/${path.slice(pathStartIndex)}?token_hash=${token_hash}&type=email`;
    } else {
      return `${APP_URL}/${
        this.userSetupPath
      }?token_hash=${token_hash}&type=email&next=/${path.slice(pathStartIndex)}`;
    }
  }

  async sendSignup(
    to: string,
    context: {
      token_hash: string;
    },
  ) {
    const path = "/projects";
    const html = `
    <p>To finish signing in to Rizome, <a href="${this.deeplink(
      context.token_hash,
      path,
    )}">click here</a>.</p>
    <span style="font-size: 11px;">This link will expire in 5 minutes.</span>
    `;
    await sendgridMailClient.send({
      ...this.from,
      html,
      subject: `Sign in`,
      to,
    });
  }

  async sendProjectApprovalRequest(
    to: string | string[],
    context: {
      path: string;
      projectName: string;
      token_hash: string;
    },
  ) {
    const html = `
    <p>Your approval has been requested on the Rizome project <strong>${
      context.projectName
    }</strong>.</p>
    <p>To go to the project, <a href="${this.deeplink(
      context.token_hash,
      context.path,
    )}">click here</a>.</p>
    `;
    await sendgridMailClient.send({
      ...this.from,
      html,
      subject: `Approval requested - ${context.projectName}`,
      to,
    });
  }

  async sendProjectContributorAdded(
    to: string | string[],
    context: {
      path: string;
      projectName: string;
      token_hash: string;
    },
  ) {
    const html = `
    <p>You were added as a contributor on the Rizome project <strong>${
      context.projectName
    }</strong>.</p>
    <p>To go to the project, <a href="${this.deeplink(
      context.token_hash,
      context.path,
    )}">click here</a>.</p>`;
    await sendgridMailClient.send({
      ...this.from,
      html,
      subject: `Added to project - ${context.projectName}`,
      to,
    });
  }

  async sendUserInvite(
    to: string | string[],
    context: {
      fromName: string;
      organizationName: string;
      path: string;
      token_hash: string;
    },
  ) {
    const html = `
    <p><strong>${context.fromName}</strong> has invited you to join <strong>${
      context.organizationName
    }</strong> on Rizome.</p>
    <p>To get started, <a href="${this.deeplink(
      context.token_hash,
      context.path,
    )}">click here</a>.</p>`;
    await sendgridMailClient.send({
      ...this.from,
      html,
      subject: `Invitation from ${context.fromName}`,
      to,
    });
  }

  async sendFeedbackEmailAsync({
    name,
    email,
    organizationName,
    goal,
    problem,
    solution,
    additionalInfo,
  }: {
    name: string;
    email: string;
    organizationName: string;
    goal: string;
    problem: string;
    solution: string;
    additionalInfo: string;
  }) {
    const html = `
    <b>Name:</b> ${name}<br/>
    <b>Email:</b> ${email}<br/>
    <b>Org:</b> ${organizationName}<br/>
    <b>Goal:</b> ${goal}<br/>
    <b>Problem:</b> ${problem}<br/>
    <b>Solution:</b> ${solution}<br/>
    <b>Additional info:</b> ${additionalInfo}
    `;
    await sendgridMailClient.send({
      ...this.from,
      html,
      to: ["feedback@rizo.me"],
      subject: "Product Feedback",
      replyTo: email,
    });
  }

  async sendSupportTicketEmailAsync(context: {
    name: string;
    email: string;
    organizationName: string;
    request: string;
  }) {
    const html = `
    <b>Name:</b> ${context.name}<br/>
    <b>Email:</b> ${context.email}<br/>
    <b>Org:</b> ${context.organizationName}<br/>
    <b>Request:</b> ${context.request}<br/>
    `;
    await sendgridMailClient.send({
      ...this.from,
      to: ["support@rizo.me"],
      html,
      subject: "Support Request",
      replyTo: context.email,
    });
  }

  async sendDiscussionParticipantAddedEmailAsync(
    to: string,
    context: {
      discussionName: string;
      path: string;
      projectName: string;
      token_hash: string;
    },
  ) {
    const html = `
    <p>You were added as a participant on the Rizome discussion <strong>${
      context.discussionName
    }</strong> in the project <strong>${context.projectName}</strong>.</p>
    <p>To go to the discussion, <a href="${this.deeplink(
      context.token_hash,
      context.path,
    )}">click here</a>.</p>
    `;
    await sendgridMailClient.send({
      ...this.from,
      to,
      html,
      subject: `Added to discussion - ${context.discussionName}`,
    });
  }

  async sendDiscussionCommentMentionEmailAsync(
    to: string,
    context: {
      discussionName: string;
      path: string;
      projectName: string;
      token_hash: string;
    },
  ) {
    const html = `
    <p>You were mentioned in the Rizome discussion <strong>${
      context.discussionName
    }</strong> in the project <strong>${context.projectName}</strong>.</p>
    <p>To go to the discussion, <a href="${this.deeplink(
      context.token_hash,
      context.path,
    )}">click here</a>.</p>
    `;
    await sendgridMailClient.send({
      ...this.from,
      html,
      subject: `Mentioned in discussion - ${context.discussionName}`,
      to,
    });
  }

  async sendAggregateNotificationEmailAsync(
    to: string,
    context: {
      count: number;
      path: string;
      token_hash: string;
    },
  ) {
    const html = `
    <p>You have ${context.count}} new Rizome inbox items.</p>
    <p>To go to your inbox, <a href="${this.deeplink(
      context.token_hash,
      context.path,
    )}">click here</a>.</p>
    `;
    await sendgridMailClient.send({
      ...this.from,
      html,
      subject: "New inbox items",
      to,
    });
  }

  async sendLiveblocksCommentNotificationEmail({
    to,
    initialHtml,
    projectName,
    context,
  }: {
    to: string;
    initialHtml: string;
    projectName: string;
    context: {
      path: string;
      token_hash: string;
    };
  }) {
    const html = `
    ${initialHtml}
    <br>
    <p>To go to the project, <a href="${this.deeplink(
      context.token_hash,
      context.path,
    )}">click here</a>.</p>
    `;
    await sendgridMailClient.send({
      ...this.from,
      to,
      html,
      subject: `New comments on project ${projectName}`,
    });
  }
}
