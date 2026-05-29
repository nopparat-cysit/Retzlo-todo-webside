export type LoginIdentifier =
  | {
      type: "email";
      value: string;
    }
  | {
      type: "username";
      value: string;
    };

export function normalizeLoginIdentifier(identifier: string): LoginIdentifier {
  const value = identifier.trim().toLowerCase();

  if (value.includes("@")) {
    return {
      type: "email",
      value
    };
  }

  return {
    type: "username",
    value
  };
}
