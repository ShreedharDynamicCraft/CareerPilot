import { redirect } from "next/navigation";
import { industries } from "@/data/industries";
import CarrierProfile from "./_components/carrierProfile";
import { getUserOnboardingStatus } from "@/actions/user";

export default async function carrierform() {
  // Check if user is already onboarded
  // const { isOnboarded } = await getUserOnboardingStatus();

  // if (isOnboarded) {
  //   redirect("/dashboard");
  // }

  return (
    <main>
      <CarrierProfile industries={industries} />
    </main>
  );
}
