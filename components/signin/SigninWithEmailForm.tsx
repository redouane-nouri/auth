"use client";

import {
  ArrowRightIcon,
  EnvelopeClosedIcon,
  PaperPlaneIcon,
} from "@radix-ui/react-icons";
import { Badge, Box, Button, Flex, Text, TextField } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { getSignInWithEmailSchema } from "@/utils/functions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function SiginnWithEmailForm() {
  const router = useRouter();
  const t = useTranslations("signinCard");

  const SignInWithEmailSchema = getSignInWithEmailSchema(
    useTranslations("signinValidation")
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof SignInWithEmailSchema>>({
    resolver: zodResolver(SignInWithEmailSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof SignInWithEmailSchema>) => {
      const res = await signIn("nodemailer", {
        email: data.email,
        redirect: false,
      });

      if (!res?.ok || res?.code || res?.error) throw new Error(t("error"));
    },
  });

  const handleSubmitForm = (data: z.infer<typeof SignInWithEmailSchema>) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)}>
      <Flex direction="column" gapY="4">
        <Box>
          <Text>{t("emailTitle")}</Text>
          <TextField.Root
            aria-label={t("emailPlaceholder")}
            placeholder={t("emailPlaceholder")}
            size="2"
            {...register("email")}
          >
            <TextField.Slot>
              <EnvelopeClosedIcon />
            </TextField.Slot>
          </TextField.Root>
          {errors.email && (
            <Text color="crimson" size="1">
              {errors.email.message}
            </Text>
          )}
        </Box>
        {mutation.isError && (
          <Badge color="crimson" className="!p-3">
            {mutation.error.message}
          </Badge>
        )}
        {mutation.isSuccess && (
          <Badge color="grass" className="!p-3">
            {t("checkInbox")}
          </Badge>
        )}
        <Button
          type="submit"
          variant="ghost"
          className="mx-[1px]"
          loading={mutation.isPending}
          highContrast
        >
          {t("sendLoginLink")}
          <PaperPlaneIcon />
        </Button>
      </Flex>
    </form>
  );
}
