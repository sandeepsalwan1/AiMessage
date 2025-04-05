"use client";

import useConversation from "@/app/hooks/useConversation";
import axios from "axios";
import { CldUploadButton } from "next-cloudinary";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { HiPaperAirplane, HiPhoto } from "react-icons/hi2";
import { toast } from "react-hot-toast";
import { useState } from "react";

import MessageInput from "./MessageInput";

const Form = () => {
  const { conversationId } = useConversation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      message: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    if (isSubmitting) return;
    
    if (!data.message?.trim() && !data.image) {
      return; // Don't send empty messages
    }
    
    setIsSubmitting(true);
    setValue("message", "", { shouldValidate: true });

    axios.post("/api/messages", {
      ...data,
      conversationId,
    })
    .catch((error) => {
      console.error('Error sending message:', error.response?.data || error.message || error);
      toast.error('Failed to send message. Please try again.');
    })
    .finally(() => {
      setIsSubmitting(false);
    });
  };

  const handleUpload = (result: any) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    axios.post("/api/messages", {
      image: result?.info?.secure_url,
      conversationId,
    })
    .catch((error) => {
      console.error('Error uploading image:', error.response?.data || error.message || error);
      toast.error('Failed to upload image. Please try again.');
    })
    .finally(() => {
      setIsSubmitting(false);
    });
  };

  return (
    <div className="py-4 px-4 bg-white border-t flex items-center gap-2 lg:gap-4 w-full">
      <CldUploadButton
        options={{
          maxFiles: 1,
          sources: ['local', 'camera'],
        }}
        onUpload={handleUpload}
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      >
        <HiPhoto size={30} className="text-sky-500" />
      </CldUploadButton>
      <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2 lg:gap-4 w-full">
        <MessageInput 
          id="message" 
          register={register} 
          errors={errors} 
          required 
          placeholder="Write a message"
          disabled={isSubmitting}
        />
        <button 
          type="submit" 
          className="rounded-full p-2 bg-sky-500 cursor-pointer hover:bg-sky-600 transition"
          disabled={isSubmitting}
        >
          <HiPaperAirplane size={18} className="text-white" />
        </button>
      </form>
    </div>
  );
};

export default Form;
