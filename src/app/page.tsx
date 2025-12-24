import { requireAuth } from "@/lib/auth-utils";
import { LogoutButton } from "./logout";

const Page = async () => {
  await requireAuth();

  return (
    <div>
      <div className="min-h-screen min-w-screen flex items-center justify-center">
        protected server component
      </div>
      <LogoutButton />
    </div>
  );
};

export default Page;
