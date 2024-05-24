import { db } from "@/common/db";
import { MailService } from "@/lib/mail/mailService";
import { getEntityDisplayName } from "@/common/utils";
import { supportContract } from "xylem";
import { RecursiveRouterObj } from "@ts-rest/express/src/lib/types";

const supportRouter: RecursiveRouterObj<typeof supportContract> = {
  request: async ({ req }) => {
    const { user } = req.context;

    if (!user.organization) {
      return {
        status: 400,
        body: {
          message: "Must be in organization to send support request",
        },
      };
    }
    try {
      const { help } = req.body;

      await db.supportTicket.create({
        data: {
          userId: user.id,
          help,
        },
      });

      const mailService = new MailService(user);

      await mailService.sendSupportTicketEmailAsync({
        name: getEntityDisplayName({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        }),
        organizationName: user.organization.name,
        email: user.email,
        request: help,
      });
      return {
        status: 201,
        body: "Support ticket created",
      };
    } catch (e) {
      return {
        status: 500,
        body: {
          message: "We encountered an error sending support request.",
        },
      };
    }
  },
};

export default supportRouter;
