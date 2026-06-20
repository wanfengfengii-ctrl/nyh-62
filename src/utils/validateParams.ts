import { PressParams, ValidationResult } from "../types";

export function validateParams(params: PressParams): ValidationResult {
  const errors: ValidationResult["errors"] = [];

  if (params.leverLength <= 0) {
    errors.push({
      field: "leverLength",
      message: "杠杆长度必须大于 0",
    });
  } else if (params.leverLength > 10) {
    errors.push({
      field: "leverLength",
      message: "杠杆长度不能超过 10 米",
    });
  }

  if (params.stoneWeight <= 0) {
    errors.push({
      field: "stoneWeight",
      message: "压石重量必须大于 0",
    });
  } else if (params.stoneWeight > 2000) {
    errors.push({
      field: "stoneWeight",
      message: "压石重量不能超过 2000 千克",
    });
  }

  if (params.fruitWeight <= 0) {
    errors.push({
      field: "fruitWeight",
      message: "果料重量必须大于 0",
    });
  } else if (params.fruitWeight > 500) {
    errors.push({
      field: "fruitWeight",
      message: "果料重量不能超过 500 千克",
    });
  }

  if (params.moistureContent < 0 || params.moistureContent > 100) {
    errors.push({
      field: "moistureContent",
      message: "含水率必须在 0 到 100 之间",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
