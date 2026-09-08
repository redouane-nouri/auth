"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons";
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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "@/lib/axios/axios";
import { getForgotPasswordSchema } from "@/utils/functions";

const ForgotPasswordCard = () => {
  /*
    Forgot password card i18n messages
  */
  const t = useTranslations("forgotPasswordCard");
  /*
    Get Zod validation schema with the i18n messages.
  */
  const forgotPasswordSchema = getForgotPasswordSchema(
    useTranslations("forgotPasswordValidation")
  );
  /*
    The mutation instance that will be used to send the forgot password request.
  */
  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof forgotPasswordSchema>) => {
      return api.post("/auth/password/forgot", data);
    },
    onSuccess() {
      /*
        Clean form inputs.
      */
      reset();
    },
  });
  /*
    Forgot password button click handler.
  */
  const handleSubmitForm = (data: z.infer<typeof forgotPasswordSchema>) => {
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
  } = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  return (
    <Box my="auto">
      <Container size="1">
        <Card>
          <form onSubmit={handleSubmit(handleSubmitForm)}>
            <Flex direction="column" gapY="4">
              <Heading>{t("heading")}</Heading>
              <Box>
                <Text>{t("emailTitle")}</Text>
                <TextField.Root
                  aria-label={t("emailPlaceholder")}
                  placeholder={t("emailPlaceholder")}
                  {...register("email")}
                  size="2"
                  data-testid="emailInput"
                >
                  <TextField.Slot>
                    <EnvelopeClosedIcon />
                  </TextField.Slot>
                </TextField.Root>
                {errors.email && (
                  <Text data-testid="emailHint" color="crimson" size="1">
                    {errors.email.message}
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
                    ? (mutation.error.response?.data?.error ?? t("error"))
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

export default ForgotPasswordCard;
