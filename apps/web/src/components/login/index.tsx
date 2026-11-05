"use client";

import React, { useState, useEffect } from "react";
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
import { Eye, EyeOff, AtSign, Lock, Loader2 } from "lucide-react";

// Regex
const nicknameRegex = /^[a-z0-9_.-]{1,20}$/;

const playerSchema = z.object({
  nickname: z
    .string()
    .min(2, { message: "Apelido deve conter pelo menos 2 caracteres" })
    .max(20, { message: "Apelido deve conter no máximo 20 caracteres" })
    .regex(nicknameRegex, {
      message:
        "Apelido deve conter apenas letras minúsculas, números e não pode ter espaços",
    })
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(6, { message: "Senha deve conter pelo menos 6 caracteres" })
    .max(30, { message: "Senha deve conter no máximo 30 caracteres" }),
});

const Login = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    nickname: "",
    password: "",
  });

  // Verifica se o formulário está válido
  useEffect(() => {
    const validatedData = playerSchema.safeParse({
      nickname: formData.nickname,
      password: formData.password,
    });

    setIsFormValid(validatedData.success);
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validatedFields = playerSchema.safeParse({
      nickname: formData.nickname,
      password: formData.password,
    });

    if (!validatedFields.success) {
      const firstError = validatedFields.error.errors[0];
      setErrorMessage(firstError.message);
      return;
    }

    try {
      setIsLoading(true);

      const response = await api.post("/auth/login", formData);
      const data = response.data;

      if (data.token && data.player) {
        setCookie(null, "token", data.token, { path: "/" });
        setCookie(null, "player", JSON.stringify(data.player), { path: "/" });
        window.location.href = "/home";
        toast({
          title: "Login realizado com sucesso",
          description: "Você está sendo redirecionado para a página inicial",
          variant: "success",
        });
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = getApiErrorMessage(error, "Erro desconhecido");
      toast({
        title: "Erro ao tentar logar",
        description: errorMessage,
        variant: "error",
      });
      setErrorMessage(errorMessage);
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
        nickname: formData.nickname,
        password: formData.password,
      });

      if (!validatedData.success) {
        const firstError = validatedData.error.errors[0];
        setErrorMessage(firstError.message);
        return;
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <TextField.Root>
        <TextField.LabelField htmlFor="nickname">Apelido</TextField.LabelField>
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
        <TextField.LabelField htmlFor="password">Senha</TextField.LabelField>
        <TextField.ContentField>
          <TextField.InputField
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Sua Senha"
            value={formData.password}
            onChange={handleChange}
          />
          <TextField.ButtonField onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </TextField.ButtonField>
        </TextField.ContentField>
      </TextField.Root>

      <div className="space-y-2">
        <span className="text-red-700 font-bold text-sm space-y-4">
          {errorMessage}
        </span>
      </div>

      <Button
        type="submit"
        className="w-full bg-green-700 text-zinc-200 hover:bg-green-600 hover:font-bold disabled:opacity-50 disabled:bg-zinc-500 disabled:cursor-not-allowed"
        onClick={handleButtonClick}
        disabled={isLoading}
      >
        <Lock size={18} />
        {isLoading ? <Loader2 className="animate-spin" /> : "Acessar"}{" "}
      </Button>
    </form>
  );
};

export default Login;
