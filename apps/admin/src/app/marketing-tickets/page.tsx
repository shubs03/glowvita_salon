import { redirect } from "next/navigation";

export default function MarketingTicketsRedirect() {
  redirect("/marketing?tab=marketing_tickets");
  return null;
}
