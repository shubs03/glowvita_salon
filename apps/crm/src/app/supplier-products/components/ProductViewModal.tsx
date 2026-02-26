import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@repo/ui/dialog";
import { Badge } from "@repo/ui/badge";
import { Separator } from "@repo/ui/separator";
import Image from "next/image";
import StatusBadge from "./StatusBadge";
import { useMemo } from "react";

interface Category {
    _id: string;
    name: string;
    description: string;
    gstType?: "none" | "fixed" | "percentage";
    gstValue?: number;
}

interface Product {
    _id: string;
    productImages: string[];
    productName: string;
    price: number;
    salePrice: number;
    category: string;
    stock: number;
    isActive: boolean;
    description?: string;
    status: "pending" | "approved" | "disapproved" | "rejected";
    rejectionReason?: string;
    size?: string;
    sizeMetric?: string;
    keyIngredients?: string[];
    forBodyPart?: string;
    bodyPartType?: string;
    productForm?: string;
    brand?: string;
    vendorId?: { name: string };
    showOnWebsite?: boolean;
}

interface ProductViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    categories: Category[];
}

const ProductViewModal = ({
    isOpen,
    onClose,
    product,
    categories,
}: ProductViewModalProps) => {
    if (!product) return null;

    const calculateDiscountPercentage = () => {
        if (product.price > product.salePrice) {
            return Math.round(
                ((product.price - product.salePrice) / product.price) * 100
            );
        }
        return 0;
    };

    const discountPercentage = calculateDiscountPercentage();

    // GST Calculation Logic matching ProductFormFields
    const gstDetails = useMemo(() => {
        const selectedCategory = categories.find((cat) => cat.name === product.category);
        const salePrice = Number(product.salePrice) || 0;

        if (!selectedCategory || !selectedCategory.gstType || selectedCategory.gstType === "none") {
            return {
                gstType: "none",
                gstValue: 0,
                gstAmount: 0,
                finalPrice: salePrice,
            };
        }

        let gstAmount = 0;
        const gstValue = Number(selectedCategory.gstValue) || 0;

        if (selectedCategory.gstType === "fixed") {
            gstAmount = gstValue;
        } else if (selectedCategory.gstType === "percentage") {
            gstAmount = (salePrice * gstValue) / 100;
        }

        return {
            gstType: selectedCategory.gstType,
            gstValue: gstValue,
            gstAmount: gstAmount,
            finalPrice: salePrice + gstAmount,
        };
    }, [product, categories]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Product Details</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                    {/* Left Column: Images and Status */}
                    <div className="space-y-6">
                        <div className="max-w-[280px] mx-auto w-full">
                            <div className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted/20 shadow-inner">
                                <Image
                                    src={
                                        product.productImages?.[0] ||
                                        "https://placehold.co/600x600.png"
                                    }
                                    alt={product.productName}
                                    fill
                                    className="object-cover"
                                />
                                {discountPercentage > 0 && (
                                    <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                        {discountPercentage}% OFF
                                    </div>
                                )}
                            </div>
                        </div>

                        {product.productImages && product.productImages.length > 1 && (
                            <div className="max-w-[280px] mx-auto w-full">
                                <div className="grid grid-cols-5 gap-2">
                                    {product.productImages.slice(1).map((img, idx) => (
                                        <div
                                            key={idx}
                                            className="relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors cursor-pointer shadow-sm"
                                        >
                                            <Image
                                                src={img}
                                                alt={`${product.productName} ${idx + 2}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                                Status & Visibility
                            </h3>
                            <div className="flex flex-wrap gap-3 items-center">
                                <StatusBadge
                                    status={product.status}
                                    rejectionReason={product.rejectionReason}
                                />
                                <Badge
                                    variant={product.isActive ? "secondary" : "outline"}
                                    className={
                                        product.isActive
                                            ? "bg-green-100 text-green-700 hover:bg-green-100 border-none px-3"
                                            : "px-3"
                                    }
                                >
                                    {product.isActive ? "Active in Store" : "Hidden"}
                                </Badge>
                                {product.showOnWebsite === false && (
                                    <Badge
                                        variant="outline"
                                        className="bg-amber-100 text-amber-700 border-amber-200 px-3"
                                    >
                                        Hidden from Website
                                    </Badge>
                                )}
                            </div>
                            {product.status === "rejected" && product.rejectionReason && (
                                <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 font-medium">
                                    Reason: {product.rejectionReason}
                                </div>
                            )}
                        </div>

                        {product.vendorId && (
                            <div className="bg-muted/30 border border-border/50 rounded-xl p-4">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Supplier</h3>
                                <p className="font-medium text-foreground">{product.vendorId.name}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Information */}
                    <div className="space-y-6">
                        <div>
                            <p className="text-primary font-bold text-sm mb-1 uppercase tracking-widest">
                                {product.category}
                            </p>
                            <h2 className="text-3xl font-bold text-foreground mb-4 leading-tight">
                                {product.productName}
                            </h2>

                            <div className="flex items-baseline gap-3 mb-4">
                                <span className="text-4xl font-bold text-foreground">
                                    ₹{product.salePrice.toFixed(2)}
                                </span>
                                {product.price > product.salePrice && (
                                    <span className="text-xl text-muted-foreground line-through decoration-muted-foreground/50">
                                        ₹{product.price.toFixed(2)}
                                    </span>
                                )}
                            </div>



                            {product.description && (
                                <div className="mb-6">
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                                        Description
                                    </h3>
                                    <p className="text-foreground leading-relaxed text-sm">
                                        {product.description}
                                    </p>
                                </div>
                            )}
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-4">
                            <div>
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                                    Stock
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`h-2.5 w-2.5 rounded-full ${product.stock > 10
                                            ? "bg-green-500"
                                            : product.stock > 0
                                                ? "bg-amber-500"
                                                : "bg-red-500"
                                            }`}
                                    />
                                    <span className="text-base font-medium">
                                        {product.stock > 0 ? `${product.stock} Units` : "Out of Stock"}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                                    Brand
                                </h3>
                                <p className="text-base font-medium">{product.brand || "N/A"}</p>
                            </div>

                            <div>
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                                    Product Form
                                </h3>
                                <p className="text-base font-medium capitalize">
                                    {product.productForm || "N/A"}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                                    Size
                                </h3>
                                <p className="text-base font-medium">
                                    {product.size || "N/A"} {product.sizeMetric || ""}
                                </p>
                            </div>

                            <div className="col-span-1 lg:col-span-2">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                                    For Body Part
                                </h3>
                                <p className="text-base font-medium">
                                    {product.forBodyPart || "N/A"} {product.bodyPartType ? `(${product.bodyPartType})` : ""}
                                </p>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            {product.keyIngredients && product.keyIngredients.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                                        Key Ingredients
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.keyIngredients.map((ingredient, idx) => (
                                            <Badge
                                                key={idx}
                                                variant="secondary"
                                                className="px-3 py-1 rounded-full font-normal border border-border/50"
                                            >
                                                {ingredient}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>


            </DialogContent>
        </Dialog>
    );
};

export default ProductViewModal;
