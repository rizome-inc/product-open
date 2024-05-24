import { z } from "zod";
import { discussionCommentMentionSchema } from "./discussionCommentMentionSchema";

/**
 * FormData-compatible schema for uploading files attached to comments
 */

// fixme: this validation process is insane. come up with a better way to structure comments
// at very least should happen on FE and fail if incorrect, no?
export const discussionCommentContentSchema = z.object({
  value: z
    .string()
    .min(1),
    // .refine((value) => {
      // type DiscussionCommentContentDtd = {
      //   tags: string[];
      //   attributes: { [tag: string]: string[] };
      // }

      // const Dtd: DiscussionCommentContentDtd = DtdJsonValue;

      // const { window } = new JSDOM(value);
      // const body = window.document.body;

      // const { tags, attributes } = Dtd;

      // // Validate tags
      // const invalidTags = Array.from(body.querySelectorAll(":not(" + tags.join(",") + ")"));
      // if (invalidTags.length > 0) {
      //   return false;
      // }

      // // Validate attributes for each tag
      // for (const tag of tags) {
      //   const allowedAttributes = (attributes[tag] || []).concat(attributes["_all"] || []);

      //   const elements = Array.from(body.querySelectorAll(tag));
      //   for (const element of elements) {
      //     for (const attribute of element.attributes) {
      //       if (!allowedAttributes.includes(attribute.name)) {
      //         return false;
      //       }
      //     }
      //   }
      // }

    //   return true;
    // }),
  mentions: z.array(discussionCommentMentionSchema).optional().nullable(),
  fileAttachmentIds: z.array(z.string()).optional(),
});

export type DiscussionCommentContentSchema = z.infer<typeof discussionCommentContentSchema>;