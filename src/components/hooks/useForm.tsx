import { useState, ChangeEvent, FormEvent } from 'react';

// Define a generic type for the form data
type FormData = Record<string, any>; // Or a more specific base type if applicable

// Define the type for the onSubmit function
type OnSubmitCallback<T extends FormData> = (
  formData: T,
  setFormError: React.Dispatch<React.SetStateAction<string>> // Keep as string for simplicity
) => void | Promise<void>;

interface UseFormReturn<T extends FormData> {
  formData: T;
  formError: string;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  setFormError: React.Dispatch<React.SetStateAction<string>>;
  setFormData: React.Dispatch<React.SetStateAction<T>>; // Expose setFormData
}

const useForm = <T extends FormData>(
  initialState: T,
  onSubmit: OnSubmitCallback<T>
): UseFormReturn<T> => {
  const [formData, setFormData] = useState<T>(initialState);
  const [formError, setFormError] = useState<string>(""); // formError is always a string

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData, setFormError);
  };

  return { formData, formError, handleChange, handleSubmit, setFormError, setFormData };
};

export default useForm;