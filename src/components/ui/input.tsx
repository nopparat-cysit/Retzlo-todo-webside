import {
  forwardRef,
  useRef,
  type ForwardedRef,
  type InputHTMLAttributes,
  type MouseEvent,
  type MutableRefObject,
  type TextareaHTMLAttributes
} from "react";
import { CalendarDays, Clock3 } from "lucide-react";

import { cn } from "@/lib/utils";

function assignInputRef(
  node: HTMLInputElement | null,
  refs: Array<ForwardedRef<HTMLInputElement> | MutableRefObject<HTMLInputElement | null>>
) {
  refs.forEach((ref) => {
    if (!ref) return;
    if (typeof ref === "function") {
      ref(node);
    } else {
      ref.current = node;
    }
  });
}

function openNativePicker(input: HTMLInputElement | null) {
  if (!input || input.disabled || input.readOnly) return;
  input.focus();

  if (typeof input.showPicker === "function") {
    try {
      input.showPicker();
    } catch {
      // Some browsers only allow showPicker from direct user gestures.
    }
  }
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, onClick, ...props }, forwardedRef) => {
  const isDateLike = type === "date" || type === "datetime-local";
  const isTimeLike = type === "time";
  const Icon = isDateLike ? CalendarDays : isTimeLike ? Clock3 : null;
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleClick(event: MouseEvent<HTMLInputElement>) {
    onClick?.(event);
    if (!event.defaultPrevented && Icon) {
      openNativePicker(inputRef.current);
    }
  }

  const input = (
    <input
      ref={(node) => assignInputRef(node, [inputRef, forwardedRef])}
      type={type}
      className={cn(
        "h-10 w-full rounded-lg border border-white/10 bg-white/[0.065] px-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-400 focus:border-dusk-lavender/70 focus:bg-white/[0.09] focus:ring-2 focus:ring-dusk-lavender/25 disabled:cursor-not-allowed disabled:opacity-55",
        Icon && "pr-10 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0",
        className
      )}
      onClick={handleClick}
      {...props}
    />
  );

  if (Icon) {
    return (
      <span className="relative block w-full">
        {input}
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-dusk-amber/80 transition hover:bg-dusk-amber/10 hover:text-dusk-amber"
          aria-label={isTimeLike ? "Open time picker" : "Open date picker"}
          onClick={() => openNativePicker(inputRef.current)}
        >
          <Icon className="h-4 w-4" />
        </button>
      </span>
    );
  }

  return (
    input
  );
});
Input.displayName = "Input";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-lg border border-white/10 bg-white/[0.065] px-3 py-2 text-sm text-stone-100 outline-none transition placeholder:text-stone-400 focus:border-dusk-lavender/70 focus:bg-white/[0.09] focus:ring-2 focus:ring-dusk-lavender/25 disabled:cursor-not-allowed disabled:opacity-55",
        className
      )}
      {...props}
    />
  );
}
