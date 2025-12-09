"use client";

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
  Strong,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { socialProviders } from "../../utils/constants";
import { z } from "zod";
import { getUserSignInSchema } from "@/utils/functions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const SigninCard = () => {
  const router = useRouter();
  const t = useTranslations("signinCard");

  const SignInSchema = getUserSignInSchema(useTranslations("signinValidation"));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof SignInSchema>) => {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if(!res.ok || res.code || res.error)
        throw new Error(res.code || t("error"));
    },
    onSuccess(){
      router.push("/");
    }
  });

  const handleSubmitForm = (data: z.infer<typeof SignInSchema>) => {
    mutation.mutate(data);
  };

  return (
    <Box>
      <Container size="1">
        <Card>
          <form onSubmit={handleSubmit(handleSubmitForm)}>
            <Flex direction="column" gapY="4">
              <Heading>{t("loginHeading")}</Heading>
              <Box>
                <Text>{t("emailTitle")}</Text>
                <TextField.Root
                  aria-label={t("emailPlaceholder")}
                  placeholder={t("emailPlaceholder")}
                  size="2"
                  {...register("email")}
                >
                  <TextField.Slot>
                    <PersonIcon />
                  </TextField.Slot>
                </TextField.Root>
                {errors.email && (
                  <Text color="crimson" size="1">
                    {errors.email.message}
                  </Text>
                )}
              </Box>
              <Box>
                <Text>{t("passwordTitle")}</Text>
                <TextField.Root
                  aria-label={t("passwordPlaceholder")}
                  placeholder={t("passwordPlaceholder")}
                  type="password"
                  {...register("password")}
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
              {mutation.isError && (
                <Badge color="crimson" className="!p-3">
                {mutation.error.message}
                </Badge>
              )}
               {mutation.isSuccess && (
                <Badge
                  color="grass"
                  className="!p-3"
                >
                  {t("success")}
                </Badge>
              )}
              <Button type="submit" loading={mutation.isPending} highContrast>
                {t("logIn")}
                <ArrowRightIcon />
              </Button>
              <Flex align="center">
                <Text size="2">
                  {t("noAccount")}
                  <Strong className="hover:border-b-2 cursor-pointer ml-2 mr-1">
                    {t("signUpNow")}
                  </Strong>
                </Text>
              </Flex>
              <Text align="center">{t("orSeparator")}</Text>
              {socialProviders.map((socialProvider, index) => (
                <Button key={index} variant="outline" highContrast>
                  <socialProvider.icon />
                  {socialProvider.label}
                </Button>
              ))}
            </Flex>
          </form>
        </Card>
      </Container>
    </Box>
  );
};

export default SigninCard;