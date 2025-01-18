"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRightIcon,
  ArrowTopRightIcon,
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
  Strong,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Axios } from "../../lib/axios/axios";
import { get_user_signup_schema } from "../../utils/functions/global_functions";

const SignupCard = () => {
  /*
    The mutation instance that will be use to signup post request.
  */
  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof user_signup_schema>) => {
      return Axios.post("/auth/signup", data);
    },
    onSuccess() {
      /*
        Clean form inputs.
      */
      reset();
    },
  });
  /*
    Using `signup_card` translations.
  */
  const t = useTranslations("signup_card");
  /*
    Get Zod validation schema with the i18n messages.
  */
  const user_signup_schema = get_user_signup_schema(
    useTranslations("signup_validation"),
  );
  /*
    Signup button click handler.
  */
  const handle_submit = (data: z.infer<typeof user_signup_schema>) => {
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
  } = useForm<z.infer<typeof user_signup_schema>>({
    resolver: zodResolver(user_signup_schema),
  });

  return (
    <Box>
      <Container size="1">
        <Card>
          <form onSubmit={handleSubmit(handle_submit)}>
            <Flex direction="column" gapY="4">
              <Heading>{t("signup_heading")}</Heading>
              <Box>
                <Text>{t("username_title")}</Text>
                <TextField.Root
                  aria-label={t("username_placeholder")}
                  placeholder={t("username_placeholder")}
                  {...register("username")}
                  size="2"
                >
                  <TextField.Slot>
                    <PersonIcon />
                  </TextField.Slot>
                </TextField.Root>
                {errors.username && (
                  <Text color="crimson" size="1">
                    {errors.username.message}
                  </Text>
                )}
              </Box>
              <Box>
                <Text>{t("password_title")}</Text>
                <TextField.Root
                  {...register("password")}
                  aria-label={t("password_placeholder")}
                  placeholder={t("password_placeholder")}
                  type="password"
                >
                  <TextField.Slot>
                    <LockClosedIcon />
                  </TextField.Slot>
                </TextField.Root>
                {errors.password && (
                  <Text color="crimson" size="1">
                    {errors.password.message}
                  </Text>
                )}
              </Box>
              <Box>
                {t("confirm_password")}
                <Text></Text>
                <TextField.Root
                  {...register("confirm_password")}
                  placeholder={t("confirm_password_hint")}
                  type="password"
                >
                  <TextField.Slot>
                    <LockClosedIcon />
                  </TextField.Slot>
                </TextField.Root>
                {errors.confirm_password && (
                  <Text color="crimson" size="1">
                    {errors.confirm_password.message}
                  </Text>
                )}
              </Box>
              {mutation.isError && (
                <Badge color="crimson" className="!p-3">
                  {axios.isAxiosError(mutation.error)
                    ? (mutation.error.response?.data?.error ??
                      "An unexpected error occurred. Please try again")
                    : "An unexpected error occurred."}
                </Badge>
              )}
              {mutation.isSuccess && (
                <Badge color="grass" className="!p-3">
                  {mutation.data.data?.message}
                </Badge>
              )}
              <Button type="submit" loading={mutation.isPending} highContrast>
                {t("sign_up")}
                <ArrowRightIcon />
              </Button>
              <Flex align="center">
                <Text size="2">
                  {t("you_have_an_account?")}
                  <Strong className="hover:border-b-2 cursor-pointer ml-2 mr-1">
                    {t("log_in_in_now!")}
                  </Strong>
                </Text>
                <ArrowTopRightIcon />
              </Flex>
            </Flex>
          </form>
        </Card>
      </Container>
    </Box>
  );
};

export default SignupCard;
