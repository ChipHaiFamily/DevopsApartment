import React from "react";

export default function ContractTemplate({ data }) {
  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }) : "-";

  return (
    <div
      id="contract-template"
      style={{
        fontFamily: "TH Sarabun New, Kanit, sans-serif",
        padding: "30mm 60mm",
        color: "#000",
        lineHeight: "3",
        fontSize: "18pt",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: "0" }}>แบบฟอร์มสัญญาเช่าห้องพัก</h2>
        <p style={{ margin: "0" }}>อาคารที่พักอาศัย เดฟออปส์ อพาร์ตเมนต์</p>
        <p style={{ margin: "5px 0", fontSize: "14pt" }}>
          เอกสารฉบับนี้ออกเมื่อวันที่ {formatDate(new Date())}
        </p>
        <hr style={{ border: "1px solid #000", margin: "10px 0 30px" }} />
      </div>

      {/* Contract Info */}
      <div>
        <p>
          สัญญาฉบับนี้ทำขึ้นระหว่าง{" "}
          <strong>เดฟออปส์ อพาร์ตเมนต์</strong> (“ผู้ให้เช่า”) ซึ่งมีที่อยู่เลขที่
          99 ถนนนั่งกิน แขวงนอนกิน เขตยังหิว
          กับ <strong>{data.tenant?.user?.fullName || "................................"}</strong> (“ผู้เช่า”)
          ซึ่งเป็นผู้เข้าพักอาศัยในห้องพักหมายเลข{" "}
          <strong>{data.room?.roomNum || "........"}</strong>{" "}
          ชั้น {data.room?.floor || "...."} ตามรายละเอียดดังต่อไปนี้
        </p>

        <ol style={{ paddingLeft: "25px" }}>
          <li>
             ระยะเวลาการเช่าเริ่มตั้งแต่วันที่{" "}
            <strong>{formatDate(data.startDate)}</strong> ถึงวันที่{" "}
            <strong>{formatDate(data.endDate)}</strong>
          </li>
          <li>
             ค่าเช่าห้องพักเดือนละ{" "}
            <strong>฿{data.rentAmount?.toLocaleString() || "-"}</strong>{" "}
            บาท โดยชำระทุก{data.billingCycle === "monthly" ? "เดือน" : "ปี"}ล่วงหน้า
          </li>
          <li>
            ผู้เช่าชำระเงินมัดจำเป็นจำนวน{" "}
            <strong>฿{data.deposit?.toLocaleString() || "-"}</strong>{" "}
            บาท ซึ่งจะคืนให้เมื่อสิ้นสุดสัญญา หากไม่มีความเสียหายเกิดขึ้น
          </li>
          <li>
            ผู้เช่าต้องรักษาความสะอาดและทรัพย์สินของห้องพักให้อยู่ในสภาพดี
            และต้องไม่ดัดแปลงโครงสร้างหรือทรัพย์สินใด ๆ ของห้องพักโดยไม่ได้รับอนุญาต
          </li>
          <li>
            หากผู้เช่าประสงค์จะยกเลิกสัญญาก่อนครบกำหนด ต้องแจ้งล่วงหน้าอย่างน้อย 30 วัน
            มิฉะนั้นมัดจำจะถูกริบเป็นค่าชดเชย
          </li>
          <li>
            ผู้ให้เช่ามีสิทธิเข้าตรวจสอบสภาพห้องได้เมื่อจำเป็น
            โดยแจ้งให้ผู้เช่าทราบล่วงหน้าไม่น้อยกว่า 24 ชั่วโมง
          </li>
          <li>
            ในกรณีเกิดความเสียหายจากการใช้งานผิดวิธี ผู้เช่าต้องรับผิดชอบค่าใช้จ่ายในการซ่อมแซมทั้งหมด
          </li>
          <li>
            เมื่อสิ้นสุดสัญญา ผู้เช่าต้องคืนกุญแจและทรัพย์สินทั้งหมดของห้องพักให้ครบถ้วน
          </li>
        </ol>

        <p style={{ marginTop: "20px" }}>
          ทั้งสองฝ่ายได้อ่านและเข้าใจเงื่อนไขของสัญญาฉบับนี้โดยละเอียดแล้ว
          และยินยอมปฏิบัติตามทุกประการ
        </p>

        <p>
          สัญญาฉบับนี้มีผลตั้งแต่วันที่{" "}
          <strong>{formatDate(data.startDate)}</strong> เป็นต้นไป
          จนถึงวันที่ <strong>{formatDate(data.endDate)}</strong> หรือจนกว่าจะมีการแก้ไข/สิ้นสุดสัญญา
        </p>
      </div>

      {/* Signature Section */}
      <div style={{ marginTop: "60px", display: "flex", justifyContent: "space-around" }}>
        <div style={{ textAlign: "center" }}>
          <p>ลงชื่อ......................................................</p>
          <p>( {data.tenant?.user?.fullName || "ผู้เช่า"} )</p>
          <p>วันที่ {formatDate(data.startDate)}</p>
        </div>

        <div style={{ textAlign: "center" }}>
          <p>ลงชื่อ......................................................</p>
          <p>( ผู้ให้เช่า )</p>
          <p>วันที่ {formatDate(new Date())}</p>
        </div>
      </div>

      {/* Footer */}
      <hr style={{ margin: "40px 0 10px" }} />
      <p style={{ textAlign: "center", fontSize: "12pt", color: "#555" }}>
        เอกสารนี้เป็นเอกสารอิเล็กทรอนิกส์ที่จัดทำโดยระบบจัดการสัญญาเช่าอพาร์ตเมนต์<br />
        เดฟออปส์ อพาร์ตเมนต์ © {new Date().getFullYear()}
      </p>
    </div>
  );
}
