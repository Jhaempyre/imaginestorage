import { verificationTemplate } from "./verification";

export class EmailTemplates {
  static readonly details = {
    links: [],
    brandName: "Imaginary Storage",
    address: "",
  };

  public static verification(data: {
    email: string;
    verificationUrl: string;
    firstName: string;
    links?: { label: string; url: string }[];
    brandName?: string;
    address?: string;
  }) {
    return verificationTemplate({
      ...EmailTemplates.details,
      ...data,
    });
  }
}
