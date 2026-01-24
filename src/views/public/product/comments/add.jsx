import {
  Collapse,
  Button,
  Textarea,
  Paper,
  Text,
  Flex,
  Rating,
  Stack,
  Select,
} from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import * as Yup from "yup";
import { IconMessage2 } from "@tabler/icons-react";
import XTitle from "../../../../components/title";
// import { useSend } from "../../../../Libs/api";
import { useEffect, useState, useRef, useMemo } from "react";
import { useCookies } from "react-cookie";
import { useProduct } from "..";
import { useDispatch, useSelector } from "react-redux";
import { submitComment } from "../../../../redux/products/productcomments/addcomments/submitCommentActions";
import {
  clearSubmitCommentState,
  resetSubmitError,
} from "../../../../redux/products/productcomments/addcomments/submitCommentSlice";
import { notifications } from "@mantine/notifications";
import ErrorMessageModal from "../../../../components/errormessagemodal";
import { useNavigate } from 'react-router-dom';
import { getProductComments } from "../../../../redux/products/productcomments/getproductcomments/getProductCommentsActions";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

const commentValidationSchema = Yup.object().shape({
  comment: Yup.string()
    .required("کامنت الزامی است.")
    .min(5, "کامنت باید حداقل ۵ کاراکتر باشد.")
    .max(500, "کامنت نمی‌تواند بیش از ۵۰۰ کاراکتر باشد."),
  supplier: Yup.string()
    .required("انتخاب تامین‌کننده الزامی است."),
});

const AddComment = ({ active }) => {
  const { product } = useProduct();
  const [opened, { toggle }] = useDisclosure(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { submittedComment, submitLoading, submitError } = useSelector(
    (state) => state.submitComments || {}
  );

  const form = useForm({
    initialValues: { comment: "", rating: 0, supplier: "" },
    validate: yupResolver(commentValidationSchema),
  });

  const [cookies] = useCookies(["user"]);
  const [userPurchasedProducts, setUserPurchasedProducts] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const [modalOpen, setModalOpen] = useState(false);

  // Add refs to track processed notifications
  const processedCommentId = useRef(null);
  const processedErrorId = useRef(null);
  const [submitErrorModal, setSubmitErrorModal] = useState(false);

  // Extract unique suppliers from all combinations
  const supplierOptions = useMemo(() => {
    if (!product?.combinations) return [];
    
    const suppliersMap = new Map();
    
    product.combinations.forEach(combination => {
      combination.suppliers?.forEach(supplier => {
        if (!suppliersMap.has(supplier.id)) {
          suppliersMap.set(supplier.id, {
            value: supplier.id.toString(),
            label: supplier.name,
            psid: supplier.psid,
            shortName: supplier.shortName,
          });
        }
      });
    });
    
    return Array.from(suppliersMap.values());
  }, [product?.combinations]);


  // const getPurchasedProducts = useSend({ url: "/purchasedproducts" });

  // const getData = async () => {
  //   try {
  //     await getPurchasedProducts.mutateAsync(
  //       { userID: user?.id, productId: product?.id },
  //       {
  //         onSuccess: (response) => {
  //           setUserPurchasedProducts(
  //             response.users?.[0]?.purchased_products || []
  //           );
  //         },
  //         onError: (error) => console.error("Error:", error),
  //       }
  //     );
  //   } catch (error) {
  //   }
  // };

  const getData = async () => {
  try {
    const token = localStorage.getItem("user");
    const response = await fetch(getApiUrl("/purchasedproducts"), {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userID: user?.id, productId: product?.id }),
    });

    const result = await response.json();

    if (response.ok) {
      setUserPurchasedProducts(result.users?.[0]?.purchased_products || []);
    } else {
      console.error("Failed to get purchased products:", result);
    }
  } catch (error) {
    console.error("Error fetching purchased products:", error);
  }
};


  // Fixed comparison with proper type handling for both id and productId properties
  const hasPurchasedProduct = useMemo(() => {
    if (!userPurchasedProducts.length || !product?.id) return false;
    
    const currentProductId = product.id;
    
    return userPurchasedProducts.some((p) => {
      // Get the purchased product identifier - could be p.id or p.productId
      const purchasedId = p.id || p.productId;
      
      if (!purchasedId) return false;
      
      // Direct comparison
      if (purchasedId === currentProductId) return true;
      
      // String vs number comparison
      if (String(purchasedId) === String(currentProductId)) return true;
      if (Number(purchasedId) === Number(currentProductId)) return true;
      
      // Also check if there's a separate productId field
      if (p.productId && p.productId !== purchasedId) {
        if (p.productId === currentProductId) return true;
        if (String(p.productId) === String(currentProductId)) return true;
        if (Number(p.productId) === Number(currentProductId)) return true;
      }
      
      // Slug comparison as fallback
      if (p.slug && p.slug === currentProductId) return true;
      if (p.slug && String(p.slug) === String(currentProductId)) return true;
      
      return false;
    });
  }, [userPurchasedProducts, product?.id]);


  useEffect(() => {
    if (active && user?.id && product?.id) getData();
  }, [active, user?.id, product?.id]);

  // Modified notification effect - 500 errors now show notifications instead of modals
  useEffect(() => {
    if (!submittedComment && !submitError) return;

    // Create unique identifiers for tracking
    const commentId = submittedComment ? JSON.stringify(submittedComment) : null;
    const errorId = submitError ? JSON.stringify(submitError) : null;

    // Server returned state="error"
    if (submittedComment?.state === "error" && processedCommentId.current !== commentId) {
      processedCommentId.current = commentId;
      setSubmitErrorModal(true);
      setTimeout(() => {
        setSubmitErrorModal(false);
        dispatch(clearSubmitCommentState());
      }, 4000);
      return;
    }

    // HTTP errors
    if (submitError && processedErrorId.current !== errorId) {
      processedErrorId.current = errorId;
      const status = Number(submitError.status);

      // 400 and 422 family errors - show modal (keeping existing behavior)
      if ([400, 422].includes(status)) {
        setSubmitErrorModal(true);
        setTimeout(() => {
          setSubmitErrorModal(false);
          dispatch(clearSubmitCommentState());
        }, 4000);
        return;
      }

      // 500 family errors - show notification (CHANGED from modal to notification)
      if (status >= 500 && status < 600) {
        notifications.show({
          title: "خطای سرور",
          message: submitError.message || "مشکلی در سرور پیش آمده است. لطفاً دوباره تلاش کنید.",
          color: "red",
          autoClose: 5000,
        });
        setTimeout(() => {
          dispatch(clearSubmitCommentState());
        }, 3000);
        return;
      }

      // Auth errors
      if (status === 401) {
        setModalOpen(true);
        setTimeout(() => {
          setModalOpen(false);
          dispatch(clearSubmitCommentState());
          navigate("/");
        }, 4000);
        return;
      }

      if (status === 403) {
        setModalOpen(true);
        setTimeout(() => {
          setModalOpen(false);
          dispatch(clearSubmitCommentState());
        }, 4000);
        return;
      }

      // Other HTTP errors - show notification
      notifications.show({
        title: submitError.message || "خطا در ارسال دیدگاه",
        color: "red",
        autoClose: true,
      });
    }

    // Success
    if (submittedComment?.state === "ok" && processedCommentId.current !== commentId) {
      processedCommentId.current = commentId;
      form.reset();
      toggle();
      notifications.show({
        title: submittedComment.message || "دیدگاه شما با موفقیت ثبت شد",
        color: "green",
        autoClose: true,
      });
      setTimeout(() => {
        dispatch(clearSubmitCommentState());
        // Reset the processed ID when clearing state
        processedCommentId.current = null;
        processedErrorId.current = null;
      }, 3000);
    }
  }, [submittedComment, submitError, dispatch, form, toggle, navigate]);

  // Clear field-level submitError after delay
  useEffect(() => {
    if (submitError) {
      const timeoutId = setTimeout(() => {
        dispatch(resetSubmitError());
        processedErrorId.current = null; // Reset when clearing error
      }, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [submitError, dispatch]);

  const handleSubmit = async (values) => {
    // Reset processed flags before new submission
    processedCommentId.current = null;
    processedErrorId.current = null;

    const userName =
      user?.name ||
      user?.fullName ||
      user?.firstName ||
      user?.username ||
      "کاربر";

    // Find the selected supplier details
    const selectedSupplier = supplierOptions.find(
      option => option.value === values.supplier
    );

    const finalValues = {
      productId: product?.id,
      commentText: values.comment,
      rating: values.rating.toString(),
      name: userName,
      date: new Date().toLocaleDateString("fa-IR"),
      supplierId: values.supplier,
      supplierName: selectedSupplier?.label,
    };

    try {
      await dispatch(submitComment(finalValues)).unwrap();
      dispatch(getProductComments({ id: product?.id }));
    } catch (error) {
    }
  };

  if (!hasPurchasedProduct) return null;

  return (
    <Paper>
      {/* Modal for 401/403 auth errors */}
      <ErrorMessageModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        message={submitError?.message}
      />

      {/* Modal for 400 family errors (400, 422) and server state errors - 500 errors now handled via notifications */}
      <ErrorMessageModal
        opened={submitErrorModal}
        onClose={() => setSubmitErrorModal(false)}
        message={
          submittedComment?.state === "error" 
            ? submittedComment.message || "خطا در ارسال دیدگاه"
            : submitError?.message || "خطا در ارسال دیدگاه"
        }
      />

      <Button
        h="60"
        fullWidth
        variant="light"
        leftSection={<IconMessage2 />}
        onClick={toggle}
      >
        ثبت دیدگاه
      </Button>

      <Collapse in={opened}>
        <XTitle my="lg">دیدگاه خود را بنویسید</XTitle>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            {/* Rating field */}
            <Flex direction="column">
              <Flex>
                <Text me="lg" size="sm" fw="500">
                  امتیاز شما
                </Text>
                <Rating {...form.getInputProps("rating")} />
              </Flex>
              {((submittedComment?.state === "error" && submittedComment?.error?.rating) ||
                form.errors.rating) && (
                <Text color="red" size="sm" mt={4}>
                  {submittedComment?.error?.rating || form.errors.rating}
                </Text>
              )}
            </Flex>

            {/* Supplier selection field */}
            <Select
              label="تامین‌کننده"
              placeholder="تامین‌کننده مورد نظر را انتخاب کنید"
              data={supplierOptions}
              withAsterisk
              searchable
              clearable
              {...form.getInputProps("supplier")}
              error={
                ((submittedComment?.state === "error" &&
                  submittedComment?.error?.supplier) ||
                  form.errors.supplier) &&
                (submittedComment?.error?.supplier || form.errors.supplier)
              }
            />

            {/* Comment field */}
            <Textarea
              label="دیدگاه شما"
              withAsterisk
              rows={5}
              placeholder="دیدگاه خود را وارد کنید"
              {...form.getInputProps("comment")}
              error={
                ((submittedComment?.state === "error" &&
                  submittedComment?.error?.commentText) ||
                  form.errors.comment) &&
                (submittedComment?.error?.commentText || form.errors.comment)
              }
            />

            <Button
              w="max-content"
              type="submit"
              loading={submitLoading}
              disabled={submitLoading}
            >
              ارسال
            </Button>
          </Stack>
        </form>
      </Collapse>
    </Paper>
  );
};

export default AddComment;