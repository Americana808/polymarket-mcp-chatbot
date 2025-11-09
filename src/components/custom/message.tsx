import { motion } from "framer-motion";
import { cx } from "classix";
import { SparklesIcon } from "./icons";
import { Markdown } from "./markdown";
import { message } from "../../interfaces/interfaces";
import { MessageActions } from "@/components/custom/actions";
import { useState } from "react";
import { RelatedNews } from "@/components/custom/related-news";
import { MessageChart } from "@/components/custom/MessageChart";

export const PreviewMessage = ({ message }: { message: message }) => {
  const [showNews, setShowNews] = useState(false);

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={message.role}
    >
      <div
        className={cx(
          "group-data-[role=user]/message:bg-zinc-700 dark:group-data-[role=user]/message:bg-muted group-data-[role=user]/message:text-white flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl"
        )}
      >
        {message.role === "assistant" && (
          <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
            <SparklesIcon size={14} />
          </div>
        )}

        <div className="flex flex-col w-full">
          {message.content && (
            <div className="flex flex-col gap-4 text-left">
              <Markdown>{message.content}</Markdown>
              {message.role === "assistant" && (
                <div className="mt-2 space-y-3">
                  {/* Auto-detected chart visualization from assistant content */}
                  <MessageChart content={message.content} />

                  {/* Toggleable related news */}
                  <div>
                    <button
                      onClick={() => setShowNews((v) => !v)}
                      className="text-xs px-2 py-1 rounded-md border border-zinc-700 hover:bg-zinc-800 transition-colors"
                    >
                      {showNews ? "Hide related news" : "Show related news"}
                    </button>
                    {showNews && (
                      <div className="mt-3">
                        <RelatedNews seed={message.content} limit={4} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {message.role === "assistant" && <MessageActions message={message} />}
        </div>
      </div>
    </motion.div>
  );
};

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
      data-role={role}
    >
      <div
        className={cx(
          "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          "group-data-[role=user]/message:bg-muted"
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>
      </div>
    </motion.div>
  );
};
