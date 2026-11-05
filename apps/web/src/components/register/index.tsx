"use client";

import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { setCookie } from "nookies";
import { z } from "zod";

// Types
import { AuthFormData } from "@/types/auth";

// Hooks
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-error";

// Components
import { Button } from "@/components/ui/button";
import { TextField } from "../TextField";

// Icons
import {
  Eye,
  EyeOff,
  Loader2,
  AtSign,
  User2,
  BookUserIcon,
} from "lucide-react";

// Regex
// Regex nickname para não aceitar caracteres especiais e letras maiusculas
const nicknameRegex = /^[a-z0-9_.-]{1,20}$/;
// Regex name para não aceitar números e caracteres especiais
const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;

// Schema de Validação
const playerSchema = z.object({
  name: z
    .string()
    .min(5, { message: "Nome deve conter pelo menos 5 caracteres" })
    .max(30, { message: "Nome deve conter no máximo 30 caracteres" })
    .regex(nameRegex, {
      message: "Nome deve conter apenas letras e espaços",
    })
    .transform((value) => {
      const trimmed = value.trim().replace(/\s+/g, " ");
      return trimmed
        .split(" ")
        .filter((word) => word.length > 0)
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
    }),
  nickname: z
    .string()
    .min(2, { message: "Apelido deve conter pelo menos 2 caracteres" })
    .max(20, { message: "Apelido deve conter no máximo 20 caracteres" })
    .regex(nicknameRegex, {
      message: "Apelido deve conter apenas letras minúsculas e números",
    })
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(6, { message: "Senha deve conter pelo menos 6 caracteres" })
    .max(30, { message: "Senha deve conter no máximo 30 caracteres" }),
  confirmPassword: z
    .string()
    .min(6, { message: "Confirmar senha deve conter pelo menos 6 caracteres" })
    .max(30, {
      message: "Confirmar senha deve conter no máximo 30 caracteres",
    }),
});

const Register = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    name: "",
    nickname: "",
    password: "",
    confirmPassword: "",
  });

  // Verifica se o formulário está válido
  useEffect(() => {
    const validatedData = playerSchema.safeParse({
      name: formData.name,
      nickname: formData.nickname,
      password: formData.password,
    });

    const passwordsMatch = formData.password === formData.confirmPassword;

    setIsFormValid(validatedData.success && passwordsMatch);
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validatedFields = playerSchema.safeParse({
      name: formData.name,
      nickname: formData.nickname,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });

    if (!validatedFields.success) {
      const firstError = validatedFields.error.errors[0];
      setErrorMessage(firstError.message);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("As senhas não coincidem");
      return;
    }

    try {
      setIsLoading(true);

      const { confirmPassword, ...dataToSend } = formData;

      const response = await api.post("/auth/register", dataToSend);
      const data = response.data;

      if (data.token && data.player) {
        setCookie(null, "token", data.token, { path: "/" });
        setCookie(null, "player", JSON.stringify(data.player), { path: "/" });
        window.location.href = "/home";
        toast({
          title: "Cadastro realizado com sucesso",
          description: "Você está sendo redirecionado para a página inicial",
          variant: "success",
        });
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erro ao cadastrar",
        description: getApiErrorMessage(error, "Erro desconhecido"),
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleButtonClick = () => {
    if (!isFormValid) {
      const validatedData = playerSchema.safeParse({
        name: formData.name,
        nickname: formData.nickname,
        password: formData.password,
      });

      if (!validatedData.success) {
        const firstError = validatedData.error.errors[0];
        setErrorMessage(firstError.message);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setErrorMessage("As senhas não coincidem.");
        return;
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField.Root>
        <TextField.LabelField htmlFor="name">Seu nome</TextField.LabelField>
        <TextField.ContentField>
          <TextField.InputField
            id="name"
            name="name"
            type="text"
            placeholder="Digite seu nome"
            value={formData.name}
            onChange={handleChange}
          />
          <TextField.ButtonField>
            <User2 size={48} />
          </TextField.ButtonField>
        </TextField.ContentField>
      </TextField.Root>

      <TextField.Root>
        <TextField.LabelField htmlFor="nickname">
          Seu apelido
        </TextField.LabelField>
        <TextField.ContentField>
          <TextField.InputField
            id="nickname"
            name="nickname"
            type="text"
            placeholder="Digite seu apelido"
            value={formData.nickname}
            onChange={handleChange}
          />
          <TextField.ButtonField>
            <AtSign size={48} />
          </TextField.ButtonField>
        </TextField.ContentField>
      </TextField.Root>

      <TextField.Root>
        <TextField.LabelField htmlFor="password">
          Sua senha
        </TextField.LabelField>
        <TextField.ContentField>
          <TextField.InputField
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Digite sua senha"
            value={formData.password}
            onChange={handleChange}
          />
          <TextField.ButtonField onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </TextField.ButtonField>
        </TextField.ContentField>
      </TextField.Root>

      <TextField.Root>
        <TextField.LabelField htmlFor="confirmPassword">
          Repita a sua senha
        </TextField.LabelField>
        <TextField.ContentField>
          <TextField.InputField
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Repita a sua senha"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <TextField.ButtonField
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </TextField.ButtonField>
        </TextField.ContentField>
      </TextField.Root>

      <div className="space-y-2">
        <span className="text-red-500 text-sm space-y-4">{errorMessage}</span>
      </div>

      <Button
        type="submit"
        className="w-full bg-green-700 text-zinc-200 hover:bg-green-600 hover:font-bold disabled:opacity-50 disabled:bg-zinc-500 disabled:cursor-not-allowed"
        onClick={handleButtonClick}
        disabled={isLoading}
      >
        <BookUserIcon size={24} />
        {isLoading ? <Loader2 className="animate-spin" /> : "Cadastrar"}{" "}
      </Button>
    </form>
  );
};

export default Register;
