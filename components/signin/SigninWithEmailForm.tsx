"use client";

import {
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
import { AUTH_NODEMAILER_PROVIDER_NAME } from "@/utils/constants";

export default function SiginnWithEmailForm() {
  /*
    Signin i18n messages
  */
  const t = useTranslations("signinCard");
  /*
    Signin with email zod validation shcema
  */
  const SignInWithEmailSchema = getSignInWithEmailSchema(
    useTranslations("signinValidation")
  );
  /*
    Register input with react hook form and validation with imported zod schema
  */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof SignInWithEmailSchema>>({
    resolver: zodResolver(SignInWithEmailSchema),
  });
  /*
    Send email with authjs nodemailder provider
  */
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof SignInWithEmailSchema>) => {
      const res = await signIn(AUTH_NODEMAILER_PROVIDER_NAME, {
        email: data.email,
        redirect: false,
      });
      /*
        Authjs login api fails if res is not ok or the params code and error are set
      */
      if (!res?.ok || res?.code || res?.error) throw new Error(t("error"));
    },
  });
  /*
    Function to call after react hook submit validation
  */
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
          <Badge color="crimson" className="!p-3 block whitespace-normal break-words">
            {mutation.error.message}
          </Badge>
        )}
        {mutation.isSuccess && (
          <Badge color="grass" className="!p-3 block whitespace-normal break-words">
            {t("checkInbox")}
          </Badge>
        )}
        <Button
          type="submit"
          variant="ghost"
          className="mx-[1px]"
          loading={mutation.isPending}
          disabled={mutation.isSuccess}
          highContrast
        >
          {t("sendLoginLink")}
          <PaperPlaneIcon />
        </Button>
      </Flex>
    </form>
  );
}
