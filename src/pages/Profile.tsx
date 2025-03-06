import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useUser } from "../hooks/useUser";
import { Edit, Save } from "lucide-react";
import Navigation from "../components/Navigation";
import getCroppedImg from "../utils/cropImage";
import Cropper from "react-easy-crop";

interface Profile {
  full_name: string;
  avatar_url: string;
  phone: string;
  role: string;
  email: string;
}

export default function Profile() {
  const { user } = useUser();
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    avatar_url: "",
    phone: "",
    role: "",
    email: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [changesMade, setChangesMade] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [cropping, setCropping] = useState(false);

  // 🔹 Obtener datos del perfil
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      const { data, error } = await supabase
        .from("user_profiles")
        .select("full_name, avatar_url, phone, role, email")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("❌ Error fetching profile:", error);
      } else {
        setProfile(data);
      }
    }
    fetchProfile();
  }, [user]);

  // 🔹 Guardar cambios del perfil
  async function handleUpdate() {
    if (!user || !changesMade) return;

    const { error } = await supabase
      .from("user_profiles")
      .update({
        phone: profile.phone,
        email: profile.email,
        avatar_url: profile.avatar_url,
      })
      .eq("id", user.id);

    if (error) {
      console.error("❌ Error updating profile:", error);
    } else {
      setIsEditing(false);
      setChangesMade(false);
    }
  }

  // 🔹 Manejo de cambios en los inputs editables
  const handleChange = (field: keyof Profile, value: string) => {
    if (!isEditing) return;
    setProfile({ ...profile, [field]: value });
    setChangesMade(true);
  };

  // 🔹 Seleccionar una imagen para recortar
  function handleAvatarSelect(event: React.ChangeEvent<HTMLInputElement>) {
    if (!user) return;
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCroppedImage(imageUrl);
      setCropping(true);
    }
  }

  // 🔹 Recortar la imagen seleccionada
  async function handleCropComplete(_: any, croppedAreaPixels: any) {
    if (!croppedImage) return;
    const croppedUrl = await getCroppedImg(croppedImage, croppedAreaPixels);
    setCroppedImage(croppedUrl);
  }

  // 🔹 Guardar el recorte y subir la imagen
  async function handleSaveCrop() {
    setCropping(false);
    if (croppedImage) {
      await uploadAvatar();
    }
  }

  // 🔹 Subir la imagen recortada
  async function uploadAvatar() {
    if (!user || !croppedImage) return;

    const response = await fetch(croppedImage);
    const blob = await response.blob();
    const fileExt = "jpg";
    const filePath = `avatars/${user.id}.${fileExt}`;

    try {
      // 🔹 Subir imagen
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, { upsert: true });

      if (uploadError) throw uploadError;

      // 🔹 Obtener URL pública
      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const avatarUrl = `${publicUrlData.publicUrl}?timestamp=${new Date().getTime()}`;

      // 🔹 Guardar en BD
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile((prev) => ({ ...prev, avatar_url: avatarUrl }));
      setChangesMade(true);
    } catch (error) {
      console.error("❌ Error al subir la imagen:", error);
    }
  }

  return (
    <>
      <Navigation />
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Perfil de Usuario</h1>

        {/* Avatar */}
        <div className="flex flex-col items-center space-y-4">
          <label className="relative cursor-pointer">
            <img
              src={profile.avatar_url || "/default-avatar.png"}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border shadow-md"
            />
            {isEditing && (
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
                onChange={handleAvatarSelect}
              />
            )}
          </label>
        </div>

        {/* Cropper */}
        {cropping && croppedImage && (
          <div className="relative w-full h-64 bg-gray-900">
            <Cropper
              image={croppedImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
            <button
              className="absolute bottom-2 right-2 bg-green-600 text-white px-4 py-2 rounded"
              onClick={handleSaveCrop}
            >
              Guardar Imagen
            </button>
          </div>
        )}

        {/* Campos del perfil */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
            <input
              type="text"
              value={profile.full_name}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rol</label>
            <input
              type="text"
              value={profile.role}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-between mt-6">
          {!isEditing ? (
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setIsEditing(true)}>
              <Edit className="h-5 w-5 mr-2 inline-block" />
              Editar
            </button>
          ) : (
            <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleUpdate}>
              <Save className="h-5 w-5 mr-2 inline-block" />
              Guardar Cambios
            </button>
          )}
        </div>
      </div>
    </>
  );
}