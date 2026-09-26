import { redirectIfAuthenticated } from "@/lib/auth/auth";
import ResetPasswordCard from "@/components/resetPassword/ResetPasswordCard";
import { Suspense } from "react";
import { Box, Flex, Spinner } from "@radix-ui/themes";

export default async function ResetPasswordPage() {
  await redirectIfAuthenticated();

  return (
    /*
      `useSearchParams` inside `ResetPasswordCard` needs a Suspense boundary, otherwise Next.js bails out the whole page to client side rendering.
      A fallback avoids a blank flash while it resolves.
    */
    <Suspense
      fallback={
        <Box my="auto">
          <Flex justify="center">
            <Spinner size="3" />
          </Flex>
        </Box>
      }
    >
      <ResetPasswordCard />
    </Suspense>
  );
}
