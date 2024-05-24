import { db } from "@/common/db";
import { MailService } from "@/lib/mail/mailService";
import { getEntityDisplayName } from "@/common/utils";
import { RecursiveRouterObj } from "@ts-rest/express/src/lib/types";
import { feedbackContract } from "xylem";

const feedbackRouter: RecursiveRouterObj<typeof feedbackContract> = {
  giveFeedback: async ({ req }) => {
    const { user } = req.context;
    const { reason, difficulty, preference, suggestion } = req.body;
    if (!user.organization) {
      return {
        status: 400,
        body: {
          message: "Must be in organization to send feedback",
        },
      };
    }

    try {
      await db.feedback.create({
        data: {
          user: {
            connect: {
              id: user.id,
            },
          },
          ...req.body,
        },
      });

      const mailService = new MailService(user);
      await mailService.sendFeedbackEmailAsync({
        name: getEntityDisplayName(user),
        email: user.email,
        organizationName: user.organization.name,
        goal: reason ?? "-",
        problem: difficulty ?? "-",
        solution: preference ?? "-",
        additionalInfo: suggestion ?? "-",
      });
    } catch (e) {
      return {
        status: 500,
        body: {
          message: "Failed to create feedback. Please try again",
        },
      };
    }

    return {
      status: 201,
      body: "Feedback sent",
    };
  },
};

export default feedbackRouter;
