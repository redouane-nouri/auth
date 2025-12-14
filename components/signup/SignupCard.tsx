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
import { getUserSignupSchema } from "../../utils/functions";

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
  const userSignupSchema = getUserSignupSchema(
    useTranslations("signupValidation")
  );
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
          <form onSubmit={handleSubmit(handleSubmitForm)}>
            <Flex direction="column" gapY="4">
              <Heading>{t("signupHeading")}</Heading>
              <Box>
                <Text>{t("nameTitle")}</Text>
                <TextField.Root
                  aria-label={t("namePlaceholder")}
                  placeholder={t("namePlaceholder")}
                  {...register("name")}
                  size="2"
                  data-testid="nameInput"
                >
                  <TextField.Slot>
                    <PersonIcon />
                  </TextField.Slot>
                </TextField.Root>
                {errors.name && (
                  <Text data-testid="nameHint" color="crimson" size="1">
                    {errors.name.message}
                  </Text>
                )}
              </Box>
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
                {t("confirmPassword")}
                <Text></Text>
                <TextField.Root
                  {...register("confirmPassword")}
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
                  className="!p-3"
                >
                  {axios.isAxiosError(mutation.error)
                    ? mutation.error.response?.data?.error ?? t("error")
                    : mutation.error.message}
                </Badge>
              )}
              {mutation.isSuccess && (
                <Badge
                  data-testid="successBadge"
                  color="grass"
                  className="!p-3"
                >
                  {mutation.data.data?.message}
                </Badge>
              )}
              <Button
                type="submit"
                data-testid="submitButton"
                loading={mutation.isPending}
                highContrast
              >
                {t("signUp")}
                <ArrowRightIcon />
              </Button>
              <Flex align="center">
                <Text size="2">
                  {t("haveAccount")}
                  <Strong
                    onClick={switchToSignin}
                    className="hover:border-b-2 cursor-pointer ml-2 mr-1"
                  >
                    {t("signInNow")}
                  </Strong>
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
