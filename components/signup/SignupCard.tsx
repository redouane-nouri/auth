"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRightIcon,
  LockClosedIcon,
  PersonIcon,
  EnvelopeClosedIcon,
} from "@radix-ui/react-icons";
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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../lib/axios/axios";
import { getSignupSchema } from "../../utils/functions";

const SignupCard = ({ switchToSignin }: { switchToSignin: () => void }) => {
  /*
    The mutation instance that will be used to signup post request.
  */
  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof userSignupSchema>) => {
      return api.post("/auth/signup", data);
    },
    onSuccess() {
      /*
        Clean form inputs.
      */
      reset();
    },
  });
  /*
    Using `signupCard` translations.
  */
  const t = useTranslations("signupCard");
  /*
    Get Zod validation schema with the i18n messages.
  */
  const userSignupSchema = getSignupSchema(useTranslations("signupValidation"));
  /*
    Signup button click handler.
  */
  const handleSubmitForm = (data: z.infer<typeof userSignupSchema>) => {
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
  } = useForm<z.infer<typeof userSignupSchema>>({
    resolver: zodResolver(userSignupSchema),
  });

  return (
    <Box>
      <Container size="1">
        <Card>
          <form onSubmit={handleSubmit(handleSubmitForm)} noValidate>
            <Flex direction="column" gapY="4">
              <Heading>{t("signupHeading")}</Heading>
              <Box>
                <Text>{t("nameTitle")}</Text>
                <TextField.Root
                  aria-label={t("namePlaceholder")}
                  aria-invalid={!!errors.name}
                  aria-describedby="signup-name-error"
                  placeholder={t("namePlaceholder")}
                  autoComplete="name"
                  {...register("name")}
                  size="2"
                  data-testid="nameInput"
                >
                  <TextField.Slot>
                    <PersonIcon />
                  </TextField.Slot>
                </TextField.Root>
                {errors.name && (
                  <Text
                    id="signup-name-error"
                    data-testid="nameHint"
                    color="crimson"
                    size="1"
                  >
                    {errors.name.message}
                  </Text>
                )}
              </Box>
              <Box>
                <Text>{t("emailTitle")}</Text>
                <TextField.Root
                  aria-label={t("emailPlaceholder")}
                  aria-invalid={!!errors.email}
                  aria-describedby="signup-email-error"
                  placeholder={t("emailPlaceholder")}
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  size="2"
                  data-testid="emailInput"
                >
                  <TextField.Slot>
                    <EnvelopeClosedIcon />
                  </TextField.Slot>
                </TextField.Root>
                {errors.email && (
                  <Text
                    id="signup-email-error"
                    data-testid="emailHint"
                    color="crimson"
                    size="1"
                  >
                    {errors.email.message}
                  </Text>
                )}
              </Box>
              <Box>
                <Text>{t("passwordTitle")}</Text>
                <TextField.Root
                  {...register("password")}
                  aria-label={t("passwordPlaceholder")}
                  aria-invalid={!!errors.password}
                  aria-describedby="signup-password-error"
                  placeholder={t("passwordPlaceholder")}
                  type="password"
                  autoComplete="new-password"
                  data-testid="passwordInput"
                >
                  <TextField.Slot>
                    <LockClosedIcon />
                  </TextField.Slot>
                </TextField.Root>
                {errors.password && (
                  <Text
                    id="signup-password-error"
                    data-testid="passwordHint"
                    color="crimson"
                    size="1"
                  >
                    {errors.password.message}
                  </Text>
                )}
              </Box>
              <Box>
                <Text>{t("confirmPassword")}</Text>
                <TextField.Root
                  {...register("confirmPassword")}
                  aria-label={t("confirmPasswordPlaceholder")}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby="signup-confirmPassword-error"
                  placeholder={t("confirmPasswordPlaceholder")}
                  type="password"
                  autoComplete="new-password"
                  size="2"
                  data-testid="confirmPasswordInput"
                >
                  <TextField.Slot>
                    <LockClosedIcon />
                  </TextField.Slot>
                </TextField.Root>
                {errors.confirmPassword && (
                  <Text
                    id="signup-confirmPassword-error"
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
                    ? typeof mutation.error.response?.data?.error === "string"
                      ? mutation.error.response.data.error
                      : t("error")
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
                {t("signUp")}
                <ArrowRightIcon />
              </Button>
              <Flex align="center">
                <Text size="2">
                  {t("haveAccount")}
                  <button
                    type="button"
                    onClick={switchToSignin}
                    data-testid="switchToSigninButton"
                    className="bg-transparent border-none p-0 font-[inherit] hover:border-b-2 cursor-pointer ml-2 mr-1"
                  >
                    <Strong>{t("signInNow")}</Strong>
                  </button>
                </Text>
              </Flex>
            </Flex>
          </form>
        </Card>
      </Container>
    </Box>
  );
};

export default SignupCard;
