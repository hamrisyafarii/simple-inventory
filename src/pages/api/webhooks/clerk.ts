import { Webhook } from "svix";
import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Type definitions untuk Clerk webhook
interface EmailAddress {
  email_address: string;
  id: string;
  verification?: {
    status: string;
  };
}

interface ClerkUserData {
  id: string;
  email_addresses: EmailAddress[];
  public_metadata: {
    role?: string;
  };
}

interface ClerkWebhookEvent {
  data: ClerkUserData;
  object: string;
  type: "user.created" | "user.updated" | "user.deleted";
}

const mapClerkRoleToPrismaRole = (
  clerkRole: string | undefined,
): "ADMIN" | "STAFF" | "VIEWER" => {
  switch (clerkRole) {
    case "admin":
      return "ADMIN";
    case "staff":
      return "STAFF";
    default:
      return "VIEWER";
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET to .env");
  }

  try {
    const payload = (await buffer(req)).toString();
    const headers = req.headers;

    const svixId = headers["svix-id"];
    const svixTimestamp = headers["svix-timestamp"];
    const svixSignature = headers["svix-signature"];

    if (!svixId || !svixTimestamp || !svixSignature) {
      return res.status(400).json({ error: "Missing svix headers" });
    }

    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: ClerkWebhookEvent;

    try {
      evt = wh.verify(payload, {
        "svix-id": svixId as string,
        "svix-timestamp": svixTimestamp as string,
        "svix-signature": svixSignature as string,
      }) as ClerkWebhookEvent;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return res.status(400).json({ error: "Invalid signature" });
    }

    const eventType = evt.type;
    const { id, email_addresses } = evt.data;

    console.log("Webhook received:", eventType, id);

    switch (eventType) {
      case "user.created": {
        if (email_addresses?.length === 0) {
          return res.status(400).json({ error: "No email addresses found" });
        }

        const primaryEmail = email_addresses[0];
        if (!primaryEmail) {
          return res.status(400).json({ error: "Primary email not found" });
        }

        const userRole = mapClerkRoleToPrismaRole(
          evt.data.public_metadata.role,
        );

        await db.user.create({
          data: {
            clerkId: id,
            email: primaryEmail.email_address,
            role: userRole,
          },
        });

        console.log("User created:", id, "with role:", userRole);
        break;
      }

      case "user.updated": {
        if (email_addresses?.length === 0) {
          return res.status(400).json({ error: "No email addresses found" });
        }

        const primaryEmail = email_addresses[0];
        if (!primaryEmail) {
          return res.status(400).json({ error: "Primary email not found" });
        }

        const userRole = mapClerkRoleToPrismaRole(
          evt.data.public_metadata.role,
        );

        await db.user.update({
          where: { clerkId: id },
          data: {
            email: primaryEmail.email_address,
            role: userRole,
          },
        });

        console.log("User updated:", id);
        break;
      }

      case "user.deleted": {
        await db.user.delete({
          where: { clerkId: id },
        });

        console.log("User deleted:", id);
        break;
      }

      default: {
        console.log("Unhandled event type:", eventType);
      }
    }

    return res.status(200).json({ message: "Success", eventType });
  } catch (error) {
    console.error("Webhook handler error:", error);

    if (error instanceof Error) {
      return res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
}
