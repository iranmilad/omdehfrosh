import {
  Button,
  Textarea,
  Text,
  Flex,
  Rating,
  Stack,
  Select,
  Collapse,
  Paper,
} from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import * as Yup from "yup";
import { IconMessage2 } from "@tabler/icons-react";
import { useEffect, useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSessionQuery } from "../../../Libs/reactQuery";
import { submitComment } from "../../../redux/products/productcomments/addcomments/submitCommentActions";
import {
  clearSubmitCommentState,
  resetSubmitError,
} from "../../../redux/products/productcomments/addcomments/submitCommentSlice";
import { getProductComments } from "../../../redux/products/productcomments/getproductcomments/getProductCommentsActions";
import { notifications } from "@mantine/notifications";
import ErrorMessageModal from "../../../components/errormessagemodal";
import XTitle from "../../../components/title";

const commentValidationSchema = Yup.object().shape({
  comment: Yup.string()
    .required("کامنت الزامی است.")
    .min(5, "کامنت باید حداقل ۵ کاراکتر باشد.")
    .max(500, "کامنت نمی‌تواند بیش از ۵۰۰ کاراکتر باشد."),
  supplier: Yup.string()
    .required("انتخاب تامین‌کننده الزامی است."),
});

/**
 * Add-comment form for an order item. One comment per (order, product) – enforced by backend when orderId is passed.
 * User has bought the product (order details), so no purchased-products check.
 */
export default function OrderItemComment({ productId, supplierIdFromOrder, productName, orderId, onCommented }) {
  const [opened, { toggle }] = useDisclosure(false);
  const dispatch = useDispatch();

  const { submittedComment, submitLoading, submitError } = useSelector(
    (state) => state.submitComments || {}
  );
  const { user } = useSelector((state) => state.auth);

  const form = useForm({
    initialValues: { comment: "", rating: 0, supplier: supplierIdFromOrder ? String(supplierIdFromOrder) : "" },
    validate: yupResolver(commentValidationSchema),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [submitErrorModal, setSubmitErrorModal] = useState(false);
  const processedCommentId = useRef(null);
  const processedErrorId = useRef(null);

  // Fetch product when form is opened to get supplier options (same as product page)
  const { data: product } = useSessionQuery({
    endpoint: productId ? `/singleproduct/${productId}` : null,
    queryKey: ["singleProduct", productId],
    enabled: !!productId && opened,
  });

  const supplierOptions = useMemo(() => {
    if (!product?.combinations) return [];
    const suppliersMap = new Map();
    product.combinations.forEach((combination) => {
      combination.suppliers?.forEach((supplier) => {
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

  // Success/error handling (same as product AddComment)
  useEffect(() => {
    if (!submittedComment && !submitError) return;

    const commentId = submittedComment ? JSON.stringify(submittedComment) : null;
    const errorId = submitError ? JSON.stringify(submitError) : null;

    if (submittedComment?.state === "error" && processedCommentId.current !== commentId) {
      processedCommentId.current = commentId;
      setSubmitErrorModal(true);
      setTimeout(() => {
        setSubmitErrorModal(false);
        dispatch(clearSubmitCommentState());
      }, 4000);
      return;
    }

    if (submitError && processedErrorId.current !== errorId) {
      processedErrorId.current = errorId;
      const status = Number(submitError.status);
      // One comment per (order, product): backend returned alreadyCommented – hide form only for THIS product
      if (submitError.alreadyCommented) {
        if (productId && String(submitError.productId) === String(productId)) {
          onCommented?.(productId);
          notifications.show({
            title: "قبلاً ثبت شده",
            message: submitError.message || "شما قبلاً برای این محصول در این سفارش دیدگاه ثبت کرده‌اید",
            color: "blue",
            autoClose: 4000,
          });
          dispatch(clearSubmitCommentState());
          toggle();
        }
        return; // don't treat as generic error (for this or other product)
      }
      if ([400, 422].includes(status)) {
        setSubmitErrorModal(true);
        setTimeout(() => {
          setSubmitErrorModal(false);
          dispatch(clearSubmitCommentState());
        }, 4000);
        return;
      }
      if (status >= 500 && status < 600) {
        notifications.show({
          title: "خطای سرور",
          message: submitError.message || "مشکلی در سرور پیش آمده است. لطفاً دوباره تلاش کنید.",
          color: "red",
          autoClose: 5000,
        });
        setTimeout(() => dispatch(clearSubmitCommentState()), 3000);
        return;
      }
      if (status === 401 || status === 403) {
        setModalOpen(true);
        setTimeout(() => {
          setModalOpen(false);
          dispatch(clearSubmitCommentState());
        }, 4000);
        return;
      }
      notifications.show({
        title: submitError.message || "خطا در ارسال دیدگاه",
        color: "red",
        autoClose: true,
      });
    }

    if (submittedComment?.state === "ok" && processedCommentId.current !== commentId) {
      processedCommentId.current = commentId;
      // Only run success UI for THIS product (Redux state is global; other instances must not reset/toggle)
      if (productId && String(submittedComment?.productId) === String(productId)) {
        onCommented?.(productId);
        form.reset();
        toggle();
        notifications.show({
          title: submittedComment.message || "دیدگاه شما با موفقیت ثبت شد",
          color: "green",
          autoClose: true,
        });
        setTimeout(() => {
          dispatch(clearSubmitCommentState());
          processedCommentId.current = null;
          processedErrorId.current = null;
        }, 3000);
      }
    }
  }, [submittedComment, submitError, dispatch, form, toggle, productId, onCommented]);

  useEffect(() => {
    if (submitError) {
      const t = setTimeout(() => {
        dispatch(resetSubmitError());
        processedErrorId.current = null;
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [submitError, dispatch]);

  const handleSubmit = async (values) => {
    processedCommentId.current = null;
    processedErrorId.current = null;

    const userName =
      user?.name ||
      user?.fullName ||
      user?.firstName ||
      user?.username ||
      "کاربر";

    const selectedSupplier = supplierOptions.find((o) => o.value === values.supplier);

    const finalValues = {
      productId,
      commentText: values.comment,
      rating: values.rating.toString(),
      name: userName,
      date: new Date().toLocaleDateString("fa-IR"),
      supplierId: values.supplier,
      supplierName: selectedSupplier?.label,
      ...(orderId != null && orderId !== "" && { orderId: String(orderId) }),
    };

    try {
      await dispatch(submitComment(finalValues)).unwrap();
      dispatch(getProductComments({ id: productId, productId }));
    } catch (err) {
      // handled in effect
    }
  };

  if (!productId) return null;

  return (
    <Paper withBorder p="sm" radius="md" mt="md">
      <ErrorMessageModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        message={submitError?.message}
      />
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
        fullWidth
        variant="light"
        size="sm"
        leftSection={<IconMessage2 size={16} />}
        onClick={toggle}
      >
        ثبت دیدگاه {productName ? ` (${productName})` : ""}
      </Button>

      <Collapse in={opened}>
        <XTitle order={5} my="md">
          دیدگاه خود را بنویسید
        </XTitle>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="sm">
            <Flex direction="column" gap={4}>
              <Text size="sm" fw={500}>
                امتیاز شما
              </Text>
              <Rating {...form.getInputProps("rating")} />
              {((submittedComment?.state === "error" && submittedComment?.error?.rating) ||
                form.errors.rating) && (
                <Text c="red" size="xs">
                  {submittedComment?.error?.rating || form.errors.rating}
                </Text>
              )}
            </Flex>

            <Select
              label="تامین‌کننده"
              placeholder="تامین‌کننده مورد نظر را انتخاب کنید"
              data={supplierOptions}
              withAsterisk
              searchable
              clearable
              {...form.getInputProps("supplier")}
              error={
                ((submittedComment?.state === "error" && submittedComment?.error?.supplier) ||
                  form.errors.supplier) &&
                (submittedComment?.error?.supplier || form.errors.supplier)
              }
            />

            <Textarea
              label="دیدگاه شما"
              withAsterisk
              rows={4}
              placeholder="دیدگاه خود را وارد کنید"
              {...form.getInputProps("comment")}
              error={
                ((submittedComment?.state === "error" &&
                  submittedComment?.error?.commentText) ||
                  form.errors.comment) &&
                (submittedComment?.error?.commentText || form.errors.comment)
              }
            />

            <Button type="submit" loading={submitLoading} disabled={submitLoading} size="sm">
              ارسال
            </Button>
          </Stack>
        </form>
      </Collapse>
    </Paper>
  );
}
