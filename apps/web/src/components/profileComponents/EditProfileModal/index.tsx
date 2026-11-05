"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Zod Schemas
import { editPlayerSchema } from "@/schemas/player";

// Services
import api from "@/services/api";

// Contexts and Hooks
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-error";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Icons
import { X } from "lucide-react";

// Types
import { PlayerProfileData } from "@/types/profile";

interface EditProfileModalProps {
  player: PlayerProfileData;
  onClose: () => void;
}

export const EditProfileModal = ({
  player,
  onClose,
}: EditProfileModalProps) => {
  const queryClient = useQueryClient();
  const { updatePlayer } = useAuth();
  const [newName, setNewName] = useState(player.name);
  const [newNickname, setNewNickname] = useState(player.nickname);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>(player.avatarUrl);

  const updateProfileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.put(`/player/update/${player._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Atualiza o cache do React Query
      queryClient.setQueryData(["player", player._id], data);
      // Atualiza o AuthContext
      updatePlayer(data);

      toast({
        title: "Perfil atualizado com sucesso!",
        variant: "success",
      });

      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar perfil",
        variant: "error",
        description: getApiErrorMessage(
          error,
          "Não foi possível atualizar seu perfil."
        ),
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Handlers com atualização em tempo real
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setNewName(newValue);
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setNewNickname(newValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationResult = editPlayerSchema.safeParse({
      name: newName,
      nickname: newNickname,
    });

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors[0].message;
      toast({
        title: "Dados inválidos",
        variant: "warning",
        description: errorMessage,
      });
      return;
    }

    const formData = new FormData();
    if (newImage) {
      formData.append("avatar", newImage);
    }
    formData.append("name", newName);
    formData.append("nickname", newNickname);

    updateProfileMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 px-4 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-6 rounded-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold text-zinc-100 mb-6">Editar Perfil</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="relative min-w-20 min-h-20">
                <Image
                  src={previewImage}
                  alt="Avatar Preview"
                  fill
                  className="rounded-full object-cover object-center"
                />
                <Label
                  htmlFor="avatar"
                  className="absolute bottom-0 right-0 bg-zinc-800 p-2 rounded-full cursor-pointer hover:bg-zinc-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
              <div className="flex flex-col overflow-x-hidden">
                <span className="text-zinc-100 font-bold overflow-x-hidden text-ellipsis whitespace-nowrap">
                  {newName}
                </span>
                <span className="text-zinc-400 overflow-x-hidden text-ellipsis whitespace-nowrap">@{newNickname}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={newName}
              maxLength={50}
              minLength={3}
              onChange={handleNameChange}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nickname">Apelido</Label>
            <Input
              id="nickname"
              value={newNickname}
              maxLength={20}
              minLength={2}
              onChange={handleNicknameChange}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-transparent w-24"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="w-24 bg-green-500 text-zinc-900 hover:bg-green-700 font-bold"
            >
              {updateProfileMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
