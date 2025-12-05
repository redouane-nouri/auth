"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRightIcon,
  LockClosedIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Axios } from "../../lib/axios/axios";
import { getUserSignupSchema } from "../../utils/functions/global";

const SignupCard = () => {
  /*
    The mutation instance that will be use to signup post request.
  */
  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof userSignupSchema>) => {
      return Axios.post("/api/v1/auth/signup", data);
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
    useTranslations("signupValidation"),
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
                <Text>{t("usernameTitle")}</Text>
                <TextField.Root
                  aria-label={t("usernamePlaceholder")}
                  placeholder={t("usernamePlaceholder")}
                  {...register("username")}
                  size="2"
                  data-testid="usernameInput"
                >
                  <TextField.Slot>
                    <PersonIcon />
                  </TextField.Slot>
                </TextField.Root>
                {errors.username && (
                  <Text
                    data-testid="usernameHint"
                    color="crimson"
                    size="1"
                  >
                    {errors.username.message}
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
                  <Text
                    data-testid="passwordHint"
                    color="crimson"
                    size="1"
                  >
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
                    ? (mutation.error.response?.data?.error ?? t("error"))
                    : t("error")}
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
            </Flex>
          </form>
        </Card>
      </Container>
    </Box>
  );
};

export default SignupCard;
