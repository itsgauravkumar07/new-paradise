"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Color from "@tiptap/extension-color";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import { TextStyle } from "@tiptap/extension-text-style";
import { toast } from "react-toastify";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Palette,
  X,
  Table2,
  Undo2,
  Redo2,
  Eraser,
} from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { cn, getImageUrl } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

const MAX_IMAGE_SIZE_BYTES = 220 * 1024;

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  contentType?: string; // Content type for folder organization (e.g., 'blogs', 'destinations', 'packages')
  editorViewportClassName?: string; // Controls scrollable editor viewport height
}

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title: string;
  placeholder: string;
  buttonText: string;
}

interface ImageUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (imageUrl: string, size?: string) => void;
  contentType?: string; // Content type for folder organization
}

const Dialog = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  placeholder,
  buttonText,
}: DialogProps) => {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim());
      setValue("");
      onClose();
    } else {
      toast.error("Please enter a valid URL");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div>
          <Input
            type="url"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className="mb-4"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit}>{buttonText}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for image size classes
const getImageSizeClass = (size: string) => {
  switch (size) {
    case "small":
      return "max-w-xs";
    case "medium":
      return "max-w-md";
    case "large":
      return "max-w-2xl";
    case "full":
      return "max-w-full";
    default:
      return "max-w-md";
  }
};

const ImageUploadDialog = ({
  isOpen,
  onClose,
  onSubmit,
  contentType,
}: ImageUploadDialogProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [imageSize, setImageSize] = useState("medium");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Validate all files
    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        toast.error(`${file.name} is too large (max 220KB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("image", file);

        // Add contentType if provided (for folder organization in Cloudinary)
        if (contentType) {
          formData.append("contentType", contentType);
        }

        const token = localStorage.getItem("adminToken");
        const response = await fetch("/api/upload/image", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed for ${file.name}`);
        }

        const data = await response.json();
        return data.imageUrl;
      });

      const imageUrls = await Promise.all(uploadPromises);

      // Insert all images with the selected size
      imageUrls.forEach((imageUrl) => {
        const processedUrl = getImageUrl(imageUrl);
        console.log("Image upload - Original URL:", imageUrl);
        console.log("Image upload - Processed URL:", processedUrl);
        console.log("Image upload - Selected size:", imageSize);
        console.log("Image upload - Calling onSubmit with:", {
          processedUrl,
          imageSize,
        });
        if (processedUrl) {
          onSubmit(processedUrl, imageSize);
        }
      });

      onClose();
      toast.success(`${imageUrls.length} image(s) uploaded successfully!`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Insert Image</h3>
          <Button type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Image Size Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Size
            </label>
            <select
              value={imageSize}
              onChange={(e) => setImageSize(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
            >
              <option value="small">Small (max-width: 20rem)</option>
              <option value="medium">Medium (max-width: 28rem)</option>
              <option value="large">Large (max-width: 42rem)</option>
              <option value="full">Full Width</option>
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="mb-2"
              >
                {isUploading ? "Uploading..." : "Choose Files"}
              </Button>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 220KB each (multiple files supported)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MenuBar = ({ editor, contentType }: { editor: Editor; contentType?: string }) => {
  const [linkDialog, setLinkDialog] = useState(false);
  const [imageDialog, setImageDialog] = useState(false);
  const [imageUploadDialog, setImageUploadDialog] = useState(false);
  const [colorDropdown, setColorDropdown] = useState(false);
  const colorDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        colorDropdownRef.current &&
        !colorDropdownRef.current.contains(event.target as Node)
      ) {
        setColorDropdown(false);
      }
    };

    if (colorDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [colorDropdown]);

  if (!editor) {
    return null;
  }

  const addLink = (url: string) => {
    if (url) {
      // Basic URL validation
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }

      try {
        new URL(url); // Validate URL
        if (editor.state.selection.empty) {
          // If no selection, insert the URL as text and then link it
          editor
            .chain()
            .focus()
            .insertContent(`<a href="${url}">${url}</a>`)
            .run();
        } else {
          editor.chain().focus().setLink({ href: url }).run();
        }
        toast.success("Link added successfully!");
      } catch {
        toast.error("Please enter a valid URL");
      }
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
    toast.success("Link removed");
  };

  const addImage = (url: string, size?: string) => {
    console.log("addImage called with:", { url, size });
    if (url) {
      console.log("addImage - Received URL:", url);
      console.log("addImage - Received size:", size);
      // Basic URL validation
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }

      try {
        new URL(url); // Validate URL
        // Get the appropriate size class
        const sizeClass = size ? getImageSizeClass(size) : "max-w-full";
        // Insert image with proper HTML and styling
        const imageHtml = `<img src="${url}" class="${sizeClass} h-auto rounded-lg" alt="Uploaded image" />`;
        console.log("addImage - Image HTML:", imageHtml);
        editor.chain().focus().insertContent(imageHtml).run();
        toast.success("Image added successfully!");
      } catch (error) {
        console.error("addImage error:", error);
        toast.error("Please enter a valid image URL");
      }
    }
  };

  const setTextColor = (color: string) => {
    if (color) {
      editor.chain().focus().setColor(color).run();
      toast.success("Text color applied!");
    }
  };

  return (
    <>
      <div className="sticky top-0 z-20 border-b border-gray-200 p-2 flex flex-wrap gap-1 bg-gray-50 !text-slate-700">
        {/* Editor Actions */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <Button type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            className="h-10 w-10 p-0 hover:scale-110 transition-colors"
            title="Undo (Ctrl+Z)"
            disabled={!editor.can().chain().focus().undo().run()}
          >
            <Undo2 className="h-5 w-5" />
          </Button>
          <Button type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            className="h-10 w-10 p-0 hover:scale-110 transition-colors"
            title="Redo (Ctrl+Y)"
            disabled={!editor.can().chain().focus().redo().run()}
          >
            <Redo2 className="h-5 w-5" />
          </Button>
          <Button type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              editor.chain().focus().unsetAllMarks().clearNodes().run();
              toast.success("Formatting cleared");
            }}
            className="h-10 w-10 p-0 hover:scale-110 transition-colors"
            title="Clear Formatting"
          >
            <Eraser className="h-5 w-5" />
          </Button>
        </div>

        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <Button type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "h-10 w-10 p-0 hover:scale-110 transition-colors",
              editor.isActive("bold") && "bg-blue-100 text-blue-700"
            )}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-5 w-5" />
          </Button>
          <Button type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "h-10 w-10 p-0 hover:scale-110 transition-colors",
              editor.isActive("italic") && "bg-blue-100 text-blue-700"
            )}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-5 w-5" />
          </Button>
          <Button type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn(
              "h-10 w-10 p-0 hover:scale-110 transition-colors",
              editor.isActive("underline") && "bg-blue-100 text-blue-700"
            )}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="h-5 w-5" />
          </Button>
          <Button type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={cn(
              "h-10 w-10 p-0 hover:scale-110 transition-colors",
              editor.isActive("strike") && "bg-blue-100 text-blue-700"
            )}
            title="Strikethrough"
          >
            <Strikethrough className="h-5 w-5" />
          </Button>
          <div className="relative" ref={colorDropdownRef}>
            <Button type="button"
              variant="ghost"
              size="sm"
              onClick={() => setColorDropdown(!colorDropdown)}
              className={cn(
                "h-10 w-10 p-0 hover:scale-110 transition-colors",
                editor.isActive("textStyle") && "bg-blue-100 text-blue-700"
              )}
              title="Text Color"
            >
              <Palette className="h-5 w-5" />
            </Button>

            {/* Color Dropdown */}
            {colorDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50 min-w-[200px]">
                <div className="grid grid-cols-6 gap-2 mb-3">
                  {[
                    "#000000",
                    "#333333",
                    "#666666",
                    "#999999",
                    "#CCCCCC",
                    "#FFFFFF",
                    "#FF0000",
                    "#FF6600",
                    "#FFCC00",
                    "#00FF00",
                    "#0066FF",
                    "#6600FF",
                    "#FF0066",
                    "#FF3366",
                    "#FF6699",
                    "#FF99CC",
                    "#FFCCFF",
                    "#F0F0F0",
                    "#006600",
                    "#009900",
                    "#00CC00",
                    "#66FF00",
                    "#99FF66",
                    "#CCFF99",
                    "#000066",
                    "#0000FF",
                    "#3366FF",
                    "#6699FF",
                    "#99CCFF",
                    "#CCE6FF",
                    "#660000",
                    "#990000",
                    "#CC0000",
                    "#FF3300",
                    "#FF6633",
                    "#FF9966",
                  ].map((color, index) => (
                    <button type="button"
                      key={`color-${index}-${color}`}
                      onClick={() => {
                        setTextColor(color);
                        setColorDropdown(false);
                      }}
                      className={`w-6 h-6 rounded border-2 ${color === "#FFFFFF"
                        ? "border-gray-300"
                        : "border-gray-200"
                        } hover:scale-110 transition-transform`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <button type="button"
                  onClick={() => {
                    editor.chain().focus().unsetColor().run();
                    setColorDropdown(false);
                    toast.success("Text color removed!");
                  }}
                  className="w-full text-xs text-gray-600 hover:text-gray-800 py-1 px-2 rounded hover:bg-gray-100 transition-colors"
                >
                  Remove Color
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <Button type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={cn(
              "h-10 w-10 p-0 hover:scale-110 transition-colors",
              editor.isActive("heading", { level: 1 }) &&
              "bg-blue-100 text-blue-700"
            )}
            title="Heading 1"
          >
            <Heading1 className="h-5 w-5" />
          </Button>
          <Button type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={cn(
              "h-10 w-10 p-0 hover:scale-110 transition-colors",
              editor.isActive("heading", { level: 2 }) &&
              "bg-blue-100 text-blue-700"
            )}
            title="Heading 2"
          >
            <Heading2 className="h-5 w-5" />
          </Button>
          <Button type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={cn(
              "h-10 w-10 p-0 hover:scale-110 transition-colors",
              editor.isActive("heading", { level: 3 }) &&
              "bg-blue-100 text-blue-700"
            )}
            title="Heading 3"
          >
            <Heading3 className="h-5 w-5" />
          </Button>
          <Button type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            className={cn(
              "h-10 w-10 p-0 hover:scale-110 transition-colors",
              editor.isActive("heading", { level: 4 }) &&
              "bg-blue-100 text-blue-700"
            )}
            title="Heading 4"
          >
            <Heading4 className="h-5 w-5" />
          </Button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <Button type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              "h-10 w-10 p-0 hover:scale-110 transition-colors",
              editor.isActive("bulletList") && "bg-blue-100 text-blue-700"
            )}
            title="Bullet List"
          >
            <List className="h-5 w-5" />
          </Button>
          <Button type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              "h-10 w-10 p-0 hover:scale-110 transition-colors",
              editor.isActive("orderedList") && "bg-blue-100 text-blue-700"
            )}
            title="Numbered List"
          >
            <ListOrdered className="h-5 w-5" />
          </Button>
        </div>

        {/* Block Elements */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <Button type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn(
              "h-10 w-10 p-0 hover:scale-110 transition-colors",
              editor.isActive("blockquote") && "bg-blue-100 text-blue-700"
            )}
            title="Blockquote"
          >
            <Quote className="h-5 w-5" />
          </Button>
          <Button type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={cn(
              "h-10 w-10 p-0 hover:scale-110 transition-colors",
              editor.isActive("codeBlock") && "bg-blue-100 text-blue-700"
            )}
            title="Code Block"
          >
            <Code className="h-5 w-5" />
          </Button>
        </div>

        {/* Tables */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <Button type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
            className={cn(
              "h-10 w-10 p-0 hover:scale-110 transition-colors",
              editor.isActive("table") && "bg-blue-100 text-blue-700"
            )}
            title="Insert Table"
          >
            <Table2 className="h-5 w-5" />
          </Button>
          {editor.isActive("table") && (
            <div className="flex items-center gap-1 border-l border-gray-300 pl-2">
              <Button type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                className="h-8 px-2 text-xs hover:scale-105 transition-colors"
                title="Add Column Before"
              >
                +Col
              </Button>
              <Button type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().addRowAfter().run()}
                className="h-8 px-2 text-xs hover:scale-105 transition-colors"
                title="Add Row After"
              >
                +Row
              </Button>
              <Button type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeaderRow().run()}
                className="h-8 px-2 text-xs hover:scale-105 transition-colors"
                title="Toggle Header Row"
              >
                H-Row
              </Button>
              <Button type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
                className="h-8 px-2 text-xs hover:scale-105 transition-colors"
                title="Toggle Header Column"
              >
                H-Col
              </Button>
              <Button type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().mergeOrSplit().run()}
                className="h-8 px-2 text-xs hover:scale-105 transition-colors"
                title="Merge or Split Cells"
              >
                Merge
              </Button>
              <Button type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().deleteColumn().run()}
                className="h-8 px-2 text-xs hover:scale-105 transition-colors"
                title="Delete Column"
              >
                -Col
              </Button>
              <Button type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().deleteRow().run()}
                className="h-8 px-2 text-xs hover:scale-105 transition-colors"
                title="Delete Row"
              >
                -Row
              </Button>
              <Button type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:scale-105 transition-colors"
                title="Delete Table"
              >
                Del
              </Button>
            </div>
          )}
        </div>

        {/* Links and Images */}
        <div className="flex items-center gap-1">
          <Button type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (editor.isActive("link")) {
                removeLink();
              } else {
                setLinkDialog(true);
              }
            }}
            className={cn(
              "h-10 w-10 p-0 hover:scale-110 transition-colors",
              editor.isActive("link") && "bg-blue-100 text-blue-700"
            )}
            title={editor.isActive("link") ? "Remove Link" : "Insert Link"}
          >
            <LinkIcon className="h-5 w-5" />
          </Button>
          <Button type="button"
            variant="ghost"
            size="sm"
            onClick={() => setImageUploadDialog(true)}
            className="h-10 w-10 p-0 hover:scale-110 transition-colors"
            title="Insert Image"
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          {editor.isActive("image") && (
            <div className="flex items-center gap-1 border-l border-gray-300 pl-2">
              <Button type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const { from, to } = editor.state.selection;
                  const node = editor.state.doc.nodeAt(from);
                  if (node && node.type.name === "image") {
                    const currentClass = node.attrs.HTMLAttributes?.class || "";
                    const newClass = currentClass.replace(
                      /max-w-(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|full)/,
                      "max-w-xs"
                    );
                    editor
                      .chain()
                      .focus()
                      .updateAttributes("image", {
                        HTMLAttributes: {
                          class: newClass || "max-w-xs h-auto rounded-lg",
                        },
                      })
                      .run();
                  }
                }}
                className="h-8 px-2 text-xs hover:scale-105 transition-colors"
                title="Small"
              >
                S
              </Button>
              <Button type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const { from, to } = editor.state.selection;
                  const node = editor.state.doc.nodeAt(from);
                  if (node && node.type.name === "image") {
                    const currentClass = node.attrs.HTMLAttributes?.class || "";
                    const newClass = currentClass.replace(
                      /max-w-(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|full)/,
                      "max-w-md"
                    );
                    editor
                      .chain()
                      .focus()
                      .updateAttributes("image", {
                        HTMLAttributes: {
                          class: newClass || "max-w-md h-auto rounded-lg",
                        },
                      })
                      .run();
                  }
                }}
                className="h-8 px-2 text-xs hover:scale-105 transition-colors"
                title="Medium"
              >
                M
              </Button>
              <Button type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const { from, to } = editor.state.selection;
                  const node = editor.state.doc.nodeAt(from);
                  if (node && node.type.name === "image") {
                    const currentClass = node.attrs.HTMLAttributes?.class || "";
                    const newClass = currentClass.replace(
                      /max-w-(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|full)/,
                      "max-w-2xl"
                    );
                    editor
                      .chain()
                      .focus()
                      .updateAttributes("image", {
                        HTMLAttributes: {
                          class: newClass || "max-w-2xl h-auto rounded-lg",
                        },
                      })
                      .run();
                  }
                }}
                className="h-8 px-2 text-xs hover:scale-105 transition-colors"
                title="Large"
              >
                L
              </Button>
              <Button type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const { from, to } = editor.state.selection;
                  const node = editor.state.doc.nodeAt(from);
                  if (node && node.type.name === "image") {
                    const currentClass = node.attrs.HTMLAttributes?.class || "";
                    const newClass = currentClass.replace(
                      /max-w-(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|full)/,
                      "max-w-full"
                    );
                    editor
                      .chain()
                      .focus()
                      .updateAttributes("image", {
                        HTMLAttributes: {
                          class: newClass || "max-w-full h-auto rounded-lg",
                        },
                      })
                      .run();
                  }
                }}
                className="h-8 px-2 text-xs hover:scale-105 transition-colors"
                title="Full Width"
              >
                F
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog
        isOpen={linkDialog}
        onClose={() => setLinkDialog(false)}
        onSubmit={addLink}
        title="Insert Link"
        placeholder="Enter URL (e.g., https://example.com)"
        buttonText="Insert Link"
      />

      <ImageUploadDialog
        isOpen={imageUploadDialog}
        onClose={() => setImageUploadDialog(false)}
        onSubmit={addImage}
        contentType={contentType}
      />
    </>
  );
};

export const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Start writing...",
  className,
  contentType,
  editorViewportClassName = "max-h-[520px]",
}: RichTextEditorProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      // Filter valid image files
      const validFiles = Array.from(files).filter((file) => {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not a valid image file`);
          return false;
        }
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
          toast.error(`${file.name} is too large (max 220KB)`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      try {
        // Upload all valid images
        const uploadPromises = validFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("image", file);

          // Add contentType if provided (for folder organization in Cloudinary)
          if (contentType) {
            formData.append("contentType", contentType);
          }

          const token = localStorage.getItem("adminToken");
          const response = await fetch("/api/upload/image", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Upload failed for ${file.name}`);
          }

          const data = await response.json();
          return data.imageUrl;
        });

        const imageUrls = await Promise.all(uploadPromises);

        // Insert all images with medium size by default
        imageUrls.forEach((imageUrl) => {
          const processedUrl = getImageUrl(imageUrl);
          console.log("Drag & Drop - Original URL:", imageUrl);
          console.log("Drag & Drop - Processed URL:", processedUrl);
          if (processedUrl) {
            const sizeClass = getImageSizeClass("medium"); // Default to medium size for drag & drop
            const imageHtml = `<img src="${processedUrl}" class="${sizeClass} h-auto rounded-lg" alt="Uploaded image" />`;
            console.log("Drag & Drop - Image HTML:", imageHtml);
            editor?.chain().focus().insertContent(imageHtml).run();
          }
        });

        toast.success(
          `${imageUrls.length} image(s) uploaded and inserted successfully!`
        );
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload images. Please try again.");
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Disable default heading to configure our own
      }),
      Heading.configure({
        levels: [1, 2, 3, 4], // Enable heading levels 1-4
      }),
      TextStyle,
      Color,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer",
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4 cursor-text !text-black [&_*]:!text-black [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-[30px] [&_h2]:font-bold [&_h2]:mb-3 [&_h3]:text-[24px] [&_h3]:font-bold [&_h3]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mb-2 [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:!text-gray-700 [&_pre]:bg-gray-100 [&_pre]:p-3 [&_pre]:rounded [&_code]:bg-gray-100 [&_code]:p-1 [&_code]:rounded [&_code]:font-mono [&_a]:!text-blue-600 [&_a]:underline [&_a]:cursor-pointer [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-100 [&_th]:p-2 [&_th]:text-left [&_td]:border [&_td]:border-gray-300 [&_td]:p-2",
      },
    },
    immediatelyRender: false,
  });

  // Sync editor content with value prop (for loading saved data)
  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      // Only update if the content is truly different to avoid cursor jumping
      // Simple string comparison works for loading saved data
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div
        className={cn(
          "border border-gray-300 rounded-md bg-white p-4",
          className
        )}
      >
        <div className="text-gray-400">Loading editor...</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border rounded-md bg-white transition-all duration-200 !text-slate-700",
        isDragOver
          ? "border-blue-500 bg-blue-50 scale-[1.02]"
          : "border-gray-300",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <MenuBar editor={editor} contentType={contentType} />
      <div className={cn("relative overflow-y-auto", editorViewportClassName)}>
        <EditorContent editor={editor} />
        {!editor.getText() && (
          <div className="absolute top-0 left-4 text-gray-400 pointer-events-none">
            {isDragOver ? "Drop the image here!" : placeholder}
          </div>
        )}
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-50 bg-opacity-80 flex items-center justify-center pointer-events-none">
            <div className="text-blue-600 font-medium text-lg">
              Drop image to insert
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
