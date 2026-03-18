import { useState, useMemo, useCallback } from "react";
import { OpeningMove } from "@/lib/openings-data";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown } from "lucide-react";

interface VariationTreeProps {
  tree: OpeningMove[];
  currentPath: number[];
  onSelectNode: (path: number[]) => void;
  depth?: number;
  parentPath?: number[];
}

export default function VariationTree({
  tree,
  currentPath,
  onSelectNode,
  depth = 0,
  parentPath = [],
}: VariationTreeProps) {
  const isWhiteMove = depth % 2 === 0;
  const moveNumber = Math.floor(depth / 2) + 1;

  return (
    <div className={depth > 0 ? "ml-3 border-l border-border/40 pl-2" : ""}>
      {tree.map((node, idx) => {
        const thisPath = [...parentPath, idx];
        const isOnCurrentPath =
          currentPath.length >= thisPath.length &&
          thisPath.every((v, i) => currentPath[i] === v);
        const isCurrentNode =
          currentPath.length === thisPath.length && isOnCurrentPath;

        return (
          <VariationNode
            key={`${depth}-${idx}-${node.san}`}
            node={node}
            path={thisPath}
            currentPath={currentPath}
            isOnCurrentPath={isOnCurrentPath}
            isCurrentNode={isCurrentNode}
            isWhiteMove={isWhiteMove}
            moveNumber={moveNumber}
            depth={depth}
            isMainLine={node.isMainLine !== false}
            isSideLine={idx > 0}
            onSelectNode={onSelectNode}
          />
        );
      })}
    </div>
  );
}

interface VariationNodeProps {
  node: OpeningMove;
  path: number[];
  currentPath: number[];
  isOnCurrentPath: boolean;
  isCurrentNode: boolean;
  isWhiteMove: boolean;
  moveNumber: number;
  depth: number;
  isMainLine: boolean;
  isSideLine: boolean;
  onSelectNode: (path: number[]) => void;
}

function VariationNode({
  node,
  path,
  currentPath,
  isOnCurrentPath,
  isCurrentNode,
  isWhiteMove,
  moveNumber,
  depth,
  isMainLine,
  isSideLine,
  onSelectNode,
}: VariationNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const hasSideLines = node.children.filter((_, i) => i > 0).length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: depth * 0.02 }}
    >
      <div className="flex items-center gap-1 group">
        {hasChildren && hasSideLines && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        )}
        {(!hasChildren || !hasSideLines) && (
          <span className="w-4" />
        )}

        <button
          onClick={() => onSelectNode(path)}
          className={`
            inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-sm font-mono transition-all duration-200
            ${isCurrentNode
              ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
              : isOnCurrentPath
                ? "bg-primary/15 text-primary"
                : "hover:bg-muted text-foreground/80 hover:text-foreground"
            }
            ${!isMainLine && isSideLine ? "text-xs opacity-75" : ""}
          `}
        >
          {isWhiteMove && (
            <span className="text-muted-foreground text-xs mr-0.5">
              {moveNumber}.
            </span>
          )}
          {!isWhiteMove && depth > 0 && isSideLine && (
            <span className="text-muted-foreground text-xs mr-0.5">
              {moveNumber}...
            </span>
          )}
          <span className={isWhiteMove ? "text-foreground" : "text-foreground/90"}>
            {node.san}
          </span>
        </button>

        {node.explanation && isCurrentNode && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs text-muted-foreground ml-1 max-w-[200px] truncate"
          >
            {node.explanation}
          </motion.span>
        )}
      </div>

      <AnimatePresence>
        {hasChildren && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <VariationTree
              tree={node.children}
              currentPath={currentPath}
              onSelectNode={onSelectNode}
              depth={depth + 1}
              parentPath={path}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
