import { 
    Button, 
    Center, 
    Flex, 
    Loader, 
    LoadingOverlay, 
    Pagination, 
    Paper, 
    Rating, 
    Stack, 
    Text, 
    Title 
} from "@mantine/core";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import XTitle from "../../../../components/title";
import SignleComment from "../../../../components/singleComment";
import { shallowEqual } from "@mantine/hooks";
import InfoBox from "../../../../components/InfoBox";
import { useProduct } from "..";
import { useDispatch, useSelector } from "react-redux";
import { getProductComments } from "../../../../redux/products/productcomments/getproductcomments/getProductCommentsActions";

const Comments = ({ slug, opened  }) => {
    const { supplier, isCommentsLoaded } = useProduct();
    const dispatch = useDispatch();

    const { productComments, productCommentsLoading, productCommentsError } = useSelector(
        (state) => state.getProductComments
    );

    const [selectedSupplierId, setSelectedSupplierId] = useState(null);
    const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
    
    const limit = 15;
    const [activePage, setPage] = useState(1);

    useEffect(() => {
        if (opened && slug && !hasAttemptedFetch && !isCommentsLoaded && !productCommentsLoading) {
            setHasAttemptedFetch(true);
            dispatch(getProductComments({ id: slug, productId: slug }));
        }
    }, [opened, slug, hasAttemptedFetch, isCommentsLoaded, productCommentsLoading, dispatch]);

    // Get all comments directly from the API response
    const allComments = useMemo(() => {
        if (!productComments?.data?.comments) {
            return [];
        }

        const comments = productComments.data.comments;
        // Only include comments with status "approved" or "agreed"
        const approvedComments = comments.filter(comment => 
            comment.status === "approved" || comment.status === "agreed"
        );
        return approvedComments;
    }, [productComments?.data?.comments]);

    // Helper function to normalize comment supplierId (handle null, "", undefined)
    const normalizeCommentSupplierId = (comment) => {
        const supplierId = comment.supplierId;
        // Treat null, "", undefined, -1, or empty array as null
        if (!supplierId || supplierId === "" || supplierId === -1 || (Array.isArray(supplierId) && supplierId.length === 0)) {
            return null;
        }
        return supplierId;
    };

    // Calculate suppliers based on approved/agreed comments only
    const allSuppliers = useMemo(() => {
        if (allComments.length === 0) {
            return [{
                supplierId: null,
                supplierName: "همه تامین کنندگان",
                commentsCount: 0,
                averageRating: 0
            }];
        }

        // Group comments by supplier
        const supplierGroups = {};
        
        allComments.forEach(comment => {
            const normalizedSupplierId = normalizeCommentSupplierId(comment);
            const key = normalizedSupplierId || 'null';
            
            if (!supplierGroups[key]) {
                supplierGroups[key] = {
                    supplierId: normalizedSupplierId,
                    supplierName: comment.supplierName || "N/A",
                    comments: [],
                    ratings: []
                };
            }
            
            supplierGroups[key].comments.push(comment);
            if (comment.rating && comment.rating > 0) {
                supplierGroups[key].ratings.push(comment.rating);
            }
        });

        // Convert groups to supplier objects
        const suppliers = Object.values(supplierGroups).map(group => ({
            supplierId: group.supplierId,
            supplierName: group.supplierName,
            commentsCount: group.comments.length,
            averageRating: group.ratings.length > 0 
                ? group.ratings.reduce((sum, rating) => sum + rating, 0) / group.ratings.length 
                : 0
        }));

        // Filter out suppliers with no comments or invalid names
        const validSuppliers = suppliers.filter(supplier => 
            supplier.commentsCount > 0 && 
            supplier.supplierName && 
            supplier.supplierName !== "" &&
            supplier.supplierName !== "N/A"
        );

        // Calculate overall stats for "All Suppliers"
        const allRatings = allComments
            .map(comment => comment.rating)
            .filter(rating => rating && rating > 0);
        
        const allSuppliersOption = {
            supplierId: null,
            supplierName: "همه تامین کنندگان",
            commentsCount: allComments.length,
            averageRating: allRatings.length > 0 
                ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length 
                : 0
        };

        // Return "All" option plus valid suppliers only if we have valid suppliers
        return validSuppliers.length > 0 
            ? [allSuppliersOption, ...validSuppliers]
            : [allSuppliersOption];
    }, [allComments]);

    // Filter comments based on selected supplier
    const filteredComments = useMemo(() => {
        if (selectedSupplierId === null) {
            return allComments;
        }

        const filtered = allComments.filter(comment => {
            const normalizedSupplierId = normalizeCommentSupplierId(comment);
            return normalizedSupplierId === selectedSupplierId;
        });
        
        return filtered;
    }, [allComments, selectedSupplierId]);

    // Paginated comments
    const paginatedComments = useMemo(() => {
        const startIndex = (activePage - 1) * limit;
        const endIndex = startIndex + limit;
        const result = filteredComments.slice(startIndex, endIndex);
        return result;
    }, [filteredComments, activePage, limit]);

    // Reset page when changing supplier
    useEffect(() => {
        setPage(1);
    }, [selectedSupplierId]);

    // Handle supplier selection with useCallback to prevent unnecessary re-renders
    const handleSupplierSelect = useCallback((supplierId, supplierName) => {
        setSelectedSupplierId(supplierId);
    }, []);

    // Loading states
    const isLoading = productCommentsLoading;
    const hasNoData = !productComments?.data && !productCommentsLoading;

    // Show loading spinner during any loading state
    if (isLoading) {
        return (
            <Paper mt="lg" px="lg" py="xl">
                <Center>
                    <Loader size="lg" />
                    <Text mt="md" size="sm" c="gray">در حال بارگزاری نظرات...</Text>
                </Center>
            </Paper>
        );
    }

    // Handle error state
    if (productCommentsError) {
        return (
            <Paper mt="lg" px="lg" py="xl">
                <InfoBox>خطا در بارگذاری نظرات. لطفا دوباره تلاش کنید.</InfoBox>
            </Paper>
        );
    }

    // Handle no data from API (only when not loading)
    if (hasNoData) {
        return (
            <Paper mt="lg" px="lg" py="xl">
                <InfoBox>اطلاعات نظرات در دسترس نیست</InfoBox>
            </Paper>
        );
    }

    // Handle no comments at all (only after loading is complete)
    if (allComments.length === 0) {
        return (
            <Paper mt="lg" px="lg" py="xl">
                <XTitle size="md" mb="lg">نظرات کاربران</XTitle>
                <InfoBox>هنوز نظری برای این محصول ثبت نشده است</InfoBox>
            </Paper>
        );
    }

    // Get current supplier data for display
    const currentSupplierData = selectedSupplierId 
        ? allSuppliers.find(s => s.supplierId === selectedSupplierId)
        : allSuppliers[0]; // First item is "All Suppliers"

    // Check if we should show supplier selection buttons
    // Only show if we have more than 1 supplier (more than just "All")
    const shouldShowSupplierButtons = allSuppliers.length > 1;

    return (
        <Paper mt="lg" px="lg" pos="relative">
            <LoadingOverlay visible={productCommentsLoading} zIndex={1000} />
            
            <Flex direction="column">
                {/* Header with title and rating */}
                <Flex 
                    mt="lg" 
                    w="100%" 
                    justify="space-between" 
                    align="baseline" 
                    style={{ borderBottom: "1px solid #cbd5e1" }} 
                    pb="lg"
                >
                    <XTitle size="md">نظرات کاربران</XTitle>
                    <Flex align="center" gap="md">
                        <Flex direction="column" align="end">
                            <Rating 
                                size="md" 
                                mb="xs" 
                                value={Math.min(currentSupplierData?.averageRating || 0, 5)} 
                                readOnly 
                            />
                            <Text c="gray" size="sm">
                                بر اساس نظرات {currentSupplierData?.commentsCount || 0} کاربر
                            </Text>
                        </Flex>
                        <Title size="h2" c="gray.7">
                            {Math.min(currentSupplierData?.averageRating || 0, 5).toFixed(1)}
                        </Title>
                    </Flex>
                </Flex>

                {/* Supplier selection buttons - only show if we have valid suppliers */}
                {shouldShowSupplierButtons && (
                    <Flex 
                        w="100%" 
                        mt="md" 
                        gap="md"
                        wrap="wrap"
                        justify="flex-start"
                        align="center" 
                        style={{ borderBottom: "1px solid #cbd5e1" }} 
                        pb="lg"
                    >
                        {allSuppliers.map((supplierItem) => (
                            <Button 
                                key={supplierItem.supplierId || 'all'}
                                variant={selectedSupplierId === supplierItem.supplierId ? "filled" : "light"} 
                                color="blue"
                                onClick={() => handleSupplierSelect(
                                    supplierItem.supplierId, 
                                    supplierItem.supplierName
                                )}
                                disabled={supplierItem.commentsCount === 0}
                                size="sm"
                            >
                                <Flex direction="column" align="center" gap={2}>
                                    <Text size="sm" fw={500}>
                                        {supplierItem.supplierName}
                                    </Text>
                                    <Text size="xs" opacity={0.7}>
                                        ({supplierItem.commentsCount} نظر)
                                    </Text>
                                </Flex>
                            </Button>
                        ))}
                    </Flex>
                )}
            </Flex>

            {/* Comments list */}
            <Stack gap="lg" mt="xl">
                {paginatedComments.length > 0 ? (
                    paginatedComments.map((comment, index) => {
                        return (
                            <MemoizedComment 
                                key={comment.commentId || `${comment._id}-${index}`} 
                                {...comment} 
                            />
                        );
                    })
                ) : (
                    <InfoBox>
                        {selectedSupplierId 
                            ? `هیچ نظری برای ${allSuppliers.find(s => s.supplierId === selectedSupplierId)?.supplierName} ثبت نشده است`
                            : "نظری برای نمایش وجود ندارد"
                        }
                    </InfoBox>
                )}
            </Stack>

            {/* Pagination */}
            {filteredComments.length > limit && (
                <Center mt="xl">
                    <Pagination                   
                        total={Math.ceil(filteredComments.length / limit)}
                        value={activePage}
                        onChange={setPage}
                        size="md"
                    />
                </Center>
            )}
        </Paper>
    );
};

const MemoizedComment = React.memo(SignleComment, (prev, next) => !shallowEqual(prev, next));

export default Comments;