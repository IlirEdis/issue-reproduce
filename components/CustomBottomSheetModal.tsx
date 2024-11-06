import React, { forwardRef, ReactNode, useCallback, useMemo } from "react";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

type Props = {
  children: ReactNode;
  snapPoints: string[];
};

const CustomBottomSheetModal = forwardRef<BottomSheetModal, Props>(
  (props, ref) => {
    // const snapPoints = useMemo(() => ["25%"], []);
    const snapPoints = useMemo(() => props.snapPoints, []);
    //   const bottomSheetRef = useRef<BottomSheetModal>(null);
    //   const handleOpen = () => bottomSheetRef.current?.present();
    const backdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          {...props}
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backdropComponent={backdrop}
        enablePanDownToClose
        //   {...props}
      >
        <BottomSheetView className='p-8'>{props.children}</BottomSheetView>
      </BottomSheetModal>
    );
  }
);

export default CustomBottomSheetModal;
