import React, { useState } from "react";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";

const TIMES = [
  "6AM",
  "9AM",
  "12PM",
  "3PM",
  "6PM",
  "9PM",
  "12AM",
  "3AM",
] as const;

const LINES = ["LINE 1", "LINE 2", "LINE 3", "LINE 4", "LINE 5"] as const;

export default function MoistureMonitoringSystem() {
  const [productionDate, setProductionDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [formData, setFormData] = useState(() => {
    const initial: any = {};

    LINES.forEach((line) => {
      initial[line] = {
        isRunning: "YES",
        lineMoisture: "6 - 8%", // Default line-level moisture
        times: {},
      };

      TIMES.forEach((time) => {
        initial[line].times[time] = {
          steam: "",
          smallConveyor: "",
          cutter: "",
          dryerSpeed: "",
          dryerTemp1: "",
          dryerTemp2: "",
          dryerTemp3: "",
          dryerTemp4: "",
          moisture: "",
        };
      });
    });

    return initial;
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    line: string,
    timeOrField: string,
    fieldOrValue: string,
    valueIfTime?: string,
  ) => {
    // If valueIfTime exists, it's a time-level field change
    if (valueIfTime !== undefined) {
      const time = timeOrField;
      const field = fieldOrValue;
      setFormData((prev: any) => ({
        ...prev,
        [line]: {
          ...prev[line],
          times: {
            ...prev[line].times,
            [time]: {
              ...prev[line].times[time],
              [field]: valueIfTime,
            },
          },
        },
      }));
    } else {
      // Line-level field change (lineMoisture)
      setFormData((prev: any) => ({
        ...prev,
        [line]: {
          ...prev[line],
          [timeOrField]: fieldOrValue,
        },
      }));
    }
  };

  const numericOnly = (value: string) => value.replace(/[^0-9.-]/g, "");

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://script.google.com/macros/s/AKfycbyTKVmnsn_JJi5w30oomkMZAuZkhdn9sx6zVjAYQ373xrvCO0hMtKp05Zl55vjsyBA/exec",
        {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({ productionDate, data: formData }),
        },
      );

      const result = await res.json();
      alert(
        result.status === "success" ? "Submitted!" : "Error: " + result.message,
      );
    } catch (err: any) {
      alert("Submission failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  const labelStyle = "text-xs font-semibold text-slate-600 mb-1";

  return (
    <div className="w-full p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex flex-col lg:flex-row justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border">
        <div>
          <h1 className="text-lg font-bold text-slate-800">
            Moisture Monitoring (8.0% max)
          </h1>
          <p className="text-sm text-slate-500 italic">
            Shift Entry: 6AM to 3AM
          </p>
          <div className="mt-4">
            <label className={labelStyle}>Production Date</label>
            <input
              type="date"
              value={productionDate}
              onChange={(e) => setProductionDate(e.target.value)}
              className={inputStyle}
            />
          </div>
        </div>

        <Button
          color="primary"
          size="sm"
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Sheet"}
        </Button>
      </div>

      <Accordion
        variant="splitted"
        selectionMode="multiple"
        defaultExpandedKeys={["line-0"]}
      >
        {LINES.map((lineName, lineIdx) => {
          return (
            <AccordionItem
              key={`line-${lineIdx}`}
              aria-label={lineName}
              title={
                <span className="font-bold text-slate-700">{lineName}</span>
              }
            >
              {/* Line Status */}
              <div className="mb-6">
                <label className={labelStyle}>Machine Status</label>
                <select
                  className={inputStyle}
                  value={formData[lineName].isRunning}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      [lineName]: {
                        ...prev[lineName],
                        isRunning: e.target.value,
                      },
                    }))
                  }
                >
                  <option value="YES">Running</option>
                  <option value="NO">Stopped</option>
                </select>
              </div>

              {/* Line-Level Moisture */}
              <div className="mb-6">
                <label className={labelStyle}>Line % Moisture</label>
                <input
                  type="text"
                  className={inputStyle}
                  value={formData[lineName].lineMoisture}
                  onChange={(e) =>
                    handleChange(
                      lineName,
                      "lineMoisture",
                      numericOnly(e.target.value),
                    )
                  }
                />
              </div>

              {/* Time Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 p-2">
                {TIMES.map((time) => {
                  const moisture =
                    parseFloat(formData[lineName].times[time].moisture) || 0;

                  return (
                    <Card key={time} shadow="sm">
                      <CardBody>
                        <div className="flex justify-between mb-3">
                          <span className="font-bold text-blue-800">
                            {time}
                          </span>
                          {(time === "12AM" || time === "3AM") && (
                            <span className="text-xs text-amber-600 font-bold">
                              Next Day
                            </span>
                          )}
                        </div>

                        <Divider className="mb-4" />

                        <div className="space-y-3">
                          {[
                            { key: "steam", label: "Steam" },
                            { key: "smallConveyor", label: "Small Conveyor" },
                            { key: "cutter", label: "Cutter" },
                            { key: "dryerSpeed", label: "Dryer Speed" },
                          ].map(({ key, label }) => (
                            <div key={key}>
                              <label className={labelStyle}>{label}</label>
                              <input
                                type="text"
                                className={inputStyle}
                                value={formData[lineName].times[time][key]}
                                onChange={(e) =>
                                  handleChange(
                                    lineName,
                                    time,
                                    key,
                                    numericOnly(e.target.value),
                                  )
                                }
                              />
                            </div>
                          ))}

                          {/* Dryer Temps T1–T4 */}
                          <div>
                            <label className={labelStyle}>
                              Dryer Temp (°C)
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                "dryerTemp1",
                                "dryerTemp2",
                                "dryerTemp3",
                                "dryerTemp4",
                              ].map((key, idx) => (
                                <input
                                  key={key}
                                  type="text"
                                  placeholder={`T${idx + 1}`}
                                  className={inputStyle}
                                  value={formData[lineName].times[time][key]}
                                  onChange={(e) =>
                                    handleChange(
                                      lineName,
                                      time,
                                      key,
                                      numericOnly(e.target.value),
                                    )
                                  }
                                />
                              ))}
                            </div>
                          </div>

                          {/* Moisture */}
                          <div>
                            <label className={labelStyle}>% Moisture</label>
                            <input
                              type="text"
                              className={`${inputStyle} ${
                                moisture > 8
                                  ? "border-red-500 focus:ring-red-500"
                                  : ""
                              }`}
                              value={formData[lineName].times[time].moisture}
                              onChange={(e) =>
                                handleChange(
                                  lineName,
                                  time,
                                  "moisture",
                                  numericOnly(e.target.value),
                                )
                              }
                            />
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
