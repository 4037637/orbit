import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { Board } from "@/lib/data/boards";

interface Props {
  board: Board;
  workspaceSlug: string;
}

export function BoardCard({ board, workspaceSlug }: Props) {
  return (
    <Link href={`/${workspaceSlug}/boards/${board.id}`}>
      <Card className="h-32 cursor-pointer transition-colors hover:bg-muted/50">
        <CardHeader>
          <CardTitle>{board.name}</CardTitle>
          {board.description && (
            <CardDescription className="line-clamp-2">
              {board.description}
            </CardDescription>
          )}
        </CardHeader>
      </Card>
    </Link>
  );
}
