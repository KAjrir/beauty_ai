"use client";

import { useToast } from "./ui/toast-provider";

export const toast = {
  success: (msg) => {
    const t = useToast();
    t.success(msg);
  },
  error: (msg) => {
    const t = useToast();
    t.error(msg);
  },
};
