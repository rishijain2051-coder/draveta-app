import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center gap-6 bg-[#faf8f4]">
      <Image
        src="/logo.png"
        alt=""
        width={56}
        height={56}
        className="animate-[spin_2.6s_linear_infinite] opacity-90"
        priority
      />
      <span className="text-xs uppercase tracking-[0.35em] text-stone-500 animate-pulse">
        Loading
      </span>
    </div>
  );
}
