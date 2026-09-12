"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon, LockClosedIcon } from "@radix-ui/react-icons";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Strong,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "@/lib/axios/axios";
import { getResetPasswordSchema } from "@/utils/functions";

const ResetPasswordCard = () => {
  /*
    Reset password card i18n messages
  */
  const t = useTranslations("resetPasswordCard");
  /*
    Get the token from the url, the user lands here through the link sent to his email by the forgot password endpoint.
  */
  const token = useSearchParams().get("token") ?? "";
  /*
    Get Zod validation schema with the i18n messages.
  */
  const resetPasswordSchema = getResetPasswordSchema(
    useTranslations("resetPasswordValidation")
  );
  /*
    The mutation instance that will be used to send the reset password request.
  */
  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof resetPasswordSchema>) => {
      return api.post("/auth/password/reset", data);
    },
    onSuccess() {
      /*
        Clean form inputs.
      */
      reset();
    },
  });
  /*
    Reset password button click handler.
  */
  const handleSubmitForm = (data: z.infer<typeof resetPasswordSchema>) => {
    mutation.mutate(data);
  };
  /*
    React hook form initialization.
  */
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
  });

  /*
    If there is no token in the url then the user didn't land here from a reset password email, show an invalid link message instead of the form.
  */
  if (!token) {
    return (
      <Box my="auto">
        <Container size="1">
          <Card>
            <Flex direction="column" gapY="4">
              <Heading>{t("heading")}</Heading>
              <Badge
                data-testid="invalidTokenBadge"
                color="crimson"
                className="!p-3 block whitespace-normal break-words"
              >
                {t("invalidToken")}
              </Badge>
              <Text size="2">
                {t("backToLogin")}
                <Link href="/connect">
                  <Strong className="hover:border-b-2 cursor-pointer ml-2 mr-1">
                    {t("logInNow")}
                  </Strong>
                </Link>
              </Text>
            </Flex>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box my="auto">
      <Container size="1">
        <Card>
          <form onSubmit={handleSubmit(handleSubmitForm)}>
            <Flex direction="column" gapY="4">
              <Heading>{t("heading")}</Heading>
              {/*
                Hidden input to submit the token alongside the password fields, it is not user editable.
              */}
              <input type="hidden" value={token} {...register("token")} />
              <Box>
                <Text>{t("passwordTitle")}</Text>
                <TextField.Root
                  {...register("password")}
                  aria-label={t("passwordPlaceholder")}
                  placeholder={t("passwordPlaceholder")}
                  type="password"
                  data-testid="passwordInput"
                >
                  <TextField.Slot>
                    <LockClosedIcon />
                  </TextField.Slot>
                </TextField.Root>
                {errors.password && (
                  <Text data-testid="passwordHint" color="crimson" size="1">
                    {errors.password.message}
                  </Text>
                )}
              </Box>
              <Box>
                <Text>{t("confirmPassword")}</Text>
                <TextField.Root
                  {...register("confirmPassword")}
                  aria-label={t("confirmPasswordPlaceholder")}
                  placeholder={t("confirmPasswordPlaceholder")}
                  type="password"
                  data-testid="confirmPasswordInput"
                >
                  <TextField.Slot>
                    <LockClosedIcon />
                  </TextField.Slot>
                </TextField.Root>
                {errors.confirmPassword && (
                  <Text
                    data-testid="confirmPasswordHint"
                    color="crimson"
                    size="1"
                  >
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </Box>
              {mutation.isError && (
                <Badge
                  data-testid="errorBadge"
                  color="crimson"
                  className="!p-3 block whitespace-normal break-words"
                >
                  {axios.isAxiosError(mutation.error)
                    ? (typeof mutation.error.response?.data?.error === "string"
                        ? mutation.error.response.data.error
                        : t("error"))
                    : mutation.error.message}
                </Badge>
              )}
              {mutation.isSuccess && (
                <Badge
                  data-testid="successBadge"
                  color="grass"
                  className="!p-3 block whitespace-normal break-words"
                >
                  {mutation.data.data?.message}
                </Badge>
              )}
              <Button
                type="submit"
                data-testid="submitButton"
                loading={mutation.isPending}
                disabled={mutation.isSuccess}
                highContrast
              >
                {t("submit")}
                <ArrowRightIcon />
              </Button>
              <Text size="2">
                {t("backToLogin")}
                <Link href="/connect">
                  <Strong className="hover:border-b-2 cursor-pointer ml-2 mr-1">
                    {t("logInNow")}
                  </Strong>
                </Link>
              </Text>
            </Flex>
          </form>
        </Card>
      </Container>
    </Box>
  );
};

export default ResetPasswordCard;
