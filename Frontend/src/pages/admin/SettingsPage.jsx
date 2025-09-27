import React, { useState } from "react";

/** หน้าตั้งค่าระบบ (4 tabs) */
export default function SettingPage() {
  const [tab, setTab] = useState("template"); // template | rates | notify | system

  return (
    <div className="container py-3" style={{ fontFamily: "Kanit, system-ui, sans-serif" }}>
      <h4 className="fw-bold mb-1">ตั้งค่าระบบ</h4>
      <div className="text-secondary mb-3">จัดการการตั้งค่าและการกำหนดค่าระบบ</div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "template" ? "active" : ""}`}
            onClick={() => setTab("template")}
          >
            เทมเพลต
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "rates" ? "active" : ""}`}
            onClick={() => setTab("rates")}
          >
            อัตราค่าบริการ
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "notify" ? "active" : ""}`}
            onClick={() => setTab("notify")}
          >
            การแจ้งเตือน
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "system" ? "active" : ""}`}
            onClick={() => setTab("system")}
          >
            ระบบ
          </button>
        </li>
      </ul>

      {/* Tab contents */}
      {tab === "template" && <TabTemplate />}
      {tab === "rates" && <TabRates />}
      {tab === "notify" && <TabNotify />}
      {tab === "system" && <TabSystem />}
    </div>
  );
}

/* ---------------- Tabs ---------------- */

function Card({ title, children }) {
  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="fw-bold mb-3">{title}</h5>
        {children}
      </div>
    </div>
  );
}

/* 1) เทมเพลต */
function TabTemplate() {
  return (
    <>
      <Card title="ข้อมูลส่วนตัว">
        <div className="mb-3">
          <label className="form-label">หัวข้อสัญญา <span className="text-danger">*</span></label>
          <input className="form-control" defaultValue="สัญญาเช่าห้องพัก" />
        </div>

        <div className="mb-3">
          <label className="form-label">เนื้อหาสัญญา</label>
          <textarea
            className="form-control"
            rows={4}
            defaultValue={`สัญญาเช่าห้องพักฉบับนี้ทำขึ้นระหว่าง [ชื่อผู้ให้เช่า] และ [ชื่อผู้เช่า] โดยมีรายละเอียดดังนี้`}
          />
        </div>

        <div className="p-3 rounded" style={{ background: "#eef5ff", border: "1px solid #d8e6ff" }}>
          <div className="small fw-semibold mb-2">ตัวแปรที่ใช้ได้:</div>
          <ul className="mb-0 small">
            <li>[ชื่อผู้ให้เช่า] - ชื่อเจ้าของอพาร์ทเมนท์</li>
            <li>[ชื่อผู้เช่า] - ชื่อผู้เช่า</li>
            <li>[หมายเลขห้อง] - หมายเลขห้องที่เช่า</li>
            <li>[ค่าเช่า] - จำนวนเงินค่าเช่า</li>
            <li>[วันเริ่มสัญญา] - วันที่เริ่มสัญญา</li>
            <li>[วันสิ้นสุดสัญญา] - วันสิ้นสุดสัญญา</li>
          </ul>
        </div>
      </Card>

      <Card title="เทมเพลตใบเสร็จ">
        <div className="mb-3">
          <label className="form-label">หัวข้อใบเสร็จ <span className="text-danger">*</span></label>
          <input className="form-control" defaultValue="ใบเสร็จรับเงิน" />
        </div>

        <div className="mb-3">
          <label className="form-label">ข้อมูลผู้ออกใบเสร็จ</label>
          <textarea
            className="form-control"
            rows={4}
            defaultValue={`ชื่อ: [ชื่อเจ้าของ]\nที่อยู่: [ที่อยู่ของอพาร์ทเมนท์]\nเบอร์โทร: [เบอร์โทรติดต่อ]`}
          />
        </div>

        <button className="btn btn-primary">บันทึกเทมเพลต</button>
      </Card>
    </>
  );
}

/* 2) อัตราค่าบริการ */
function TabRates() {
  return (
    <>
      <Card title="อัตราค่าสาธารณูปโภค">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">ค่าน้ำ (บาท/หน่วย) <span className="text-danger">*</span></label>
            <input type="number" className="form-control" defaultValue="18" />
          </div>
          <div className="col-md-6">
            <label className="form-label">ค่าไฟ (บาท/หน่วย) <span className="text-danger">*</span></label>
            <input type="number" className="form-control" defaultValue="6" />
          </div>
        </div>
      </Card>

      <Card title="นโยบายค่าปรับ">
        <div className="mb-3">
          <label className="form-label">ค่าปรับชำระล่าช้า (บาท/วัน)</label>
          <input type="number" className="form-control" defaultValue="50" />
        </div>
        <div className="mb-3">
          <label className="form-label">จำนวนงวดคงค้างก่อนคิดค่าปรับ</label>
          <input type="number" className="form-control" defaultValue="3" />
        </div>
        <button className="btn btn-primary">บันทึกการเปลี่ยนแปลง</button>
      </Card>
    </>
  );
}

/* 3) การแจ้งเตือน */
function TabNotify() {
  return (
    <>
      <Card title="การแจ้งเตือนอัตโนมัติ">
        <div className="list-group">
          <div className="list-group-item d-flex align-items-center justify-content-between">
            <div>
              <div className="fw-semibold">แจ้งเตือนใบแจ้งหนี้ครบกำหนด</div>
              <div className="text-secondary small">ส่งการแจ้งเตือนล่วงหน้าก่อนครบกำหนดชำระ 3 วัน</div>
            </div>
            <div className="form-check form-switch mb-0">
              <input className="form-check-input" type="checkbox" defaultChecked />
            </div>
          </div>

          <div className="list-group-item d-flex align-items-center justify-content-between">
            <div>
              <div className="fw-semibold">แจ้งเตือนงานซ่อมบำรุงตามกำหนด</div>
              <div className="text-secondary small">แจ้งเตือนงานซ่อมบำรุงที่ถึงกำหนด</div>
            </div>
            <div className="form-check form-switch mb-0">
              <input className="form-check-input" type="checkbox" defaultChecked />
            </div>
          </div>

          <div className="list-group-item d-flex align-items-center justify-content-between">
            <div>
              <div className="fw-semibold">แจ้งเตือนสัญญาใกล้หมดอายุ</div>
              <div className="text-secondary small">แจ้งเตือนสัญญาที่จะหมดอายุใน 30 วัน</div>
            </div>
            <div className="form-check form-switch mb-0">
              <input className="form-check-input" type="checkbox" defaultChecked />
            </div>
          </div>
        </div>
      </Card>

      <Card title="ช่องทางการแจ้งเตือน">
        <div className="list-group">
          <div className="list-group-item d-flex align-items-center justify-content-between">
            <div>
              <div className="fw-semibold">อีเมล</div>
              <div className="text-secondary small">ส่งการแจ้งเตือนไปยังอีเมล</div>
            </div>
            <div className="form-check form-switch mb-0">
              <input className="form-check-input" type="checkbox" defaultChecked />
            </div>
          </div>

          <div className="list-group-item d-flex align-items-center justify-content-between">
            <div>
              <div className="fw-semibold">LINE Notify</div>
              <div className="text-secondary small">ส่งการแจ้งเตือนผ่าน LINE</div>
            </div>
            <div className="form-check form-switch mb-0">
              <input className="form-check-input" type="checkbox" defaultChecked />
            </div>
          </div>
        </div>

        <button className="btn btn-primary mt-3">บันทึกการเปลี่ยนแปลง</button>
      </Card>
    </>
  );
}

/* 4) ระบบ */
function TabSystem() {
  return (
    <>
      <Card title="อัตราค่าสาธารณูปโภค">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">ชื่อระบบ <span className="text-danger">*</span></label>
            <input className="form-control" defaultValue="ระบบจัดการอพาร์ทเมนท์" />
          </div>
          <div className="col-md-6">
            <label className="form-label">เวอร์ชัน</label>
            <input className="form-control" defaultValue="1.0.0" disabled />
          </div>
        </div>
      </Card>

      <Card title="การแจ้งเตือนอัตโนมัติ">
        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-2">
          <div>
            <div className="fw-semibold">สำรองข้อมูลอัตโนมัติ</div>
            <div className="text-secondary small">สำรองข้อมูลทุกวันเวลา 02:00 น.</div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-outline-secondary">สำรองข้อมูลตอนนี้</button>
            <button className="btn btn-outline-secondary">กู้คืนข้อมูล</button>
            <div className="form-check form-switch mb-0 ms-2">
              <input className="form-check-input" type="checkbox" defaultChecked />
            </div>
          </div>
        </div>
      </Card>

      <Card title="การบำรุงรักษาระบบ">
        <div className="alert alert-warning" role="alert">
          <div className="fw-semibold">คำเตือน</div>
          การดำเนินการเหล่านี้อาจส่งผลกระทบต่อระบบ กรุณาใช้งานอย่างระมัดระวัง
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary">ล้างแคช</button>
          <button className="btn btn-outline-danger">รีเซ็ตระบบ</button>
        </div>
      </Card>

      <button className="btn btn-primary">บันทึกการเปลี่ยนแปลง</button>
    </>
  );
}