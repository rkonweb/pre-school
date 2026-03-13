import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class StandardPhoneInput extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final Map<String, dynamic> selectedCountry;
  final VoidCallback onSelectCountry;
  final String? errorText;
  final ValueChanged<String>? onChanged;

  const StandardPhoneInput({
    super.key,
    required this.label,
    required this.controller,
    required this.selectedCountry,
    required this.onSelectCountry,
    this.errorText,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: const TextStyle(
            fontFamily: 'Space Mono',
            fontSize: 9,
            color: Color(0xFF9BA5BF),
            letterSpacing: 2,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Country Code selector - Separate Field
            GestureDetector(
              onTap: onSelectCountry,
              child: Container(
                height: 52,
                padding: const EdgeInsets.symmetric(horizontal: 10),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border.all(
                    color: errorText != null ? const Color(0xFFFF5733) : const Color(0xFFE4E8F2),
                    width: 1.5,
                  ),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: const [
                    BoxShadow(color: Color(0x0F0D1326), blurRadius: 12, offset: Offset(0, 2)),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      selectedCountry['flag'] as String,
                      style: const TextStyle(fontSize: 18),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      selectedCountry['code'] as String,
                      style: const TextStyle(
                        fontFamily: 'Space Mono',
                        fontSize: 11,
                        color: Color(0xFF5E6B8C),
                      ),
                    ),
                    const SizedBox(width: 2),
                    const Icon(
                      Icons.arrow_drop_down_rounded,
                      size: 16,
                      color: Color(0xFF9BA5BF),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 12),
            // Phone Number Input - Separate Field
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextField(
                    controller: controller,
                    keyboardType: TextInputType.phone,
                    inputFormatters: [
                      FilteringTextInputFormatter.digitsOnly,
                      LengthLimitingTextInputFormatter(selectedCountry['digits'] as int),
                    ],
                    onChanged: onChanged,
                    style: const TextStyle(
                      fontFamily: 'Exo 2',
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF0D1326),
                      letterSpacing: 2,
                    ),
                    decoration: InputDecoration(
                      hintText: '98765 43210',
                      hintStyle: const TextStyle(
                        fontFamily: 'Figtree',
                        fontSize: 14,
                        fontWeight: FontWeight.w400,
                        color: Color(0xFFCDD3E2),
                      ),
                      filled: true,
                      fillColor: errorText != null ? const Color(0xFFFFF1EE) : Colors.white,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE4E8F2), width: 1.5),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(
                          color: errorText != null ? const Color(0xFFFF5733) : const Color(0xFFE4E8F2),
                          width: 1.5,
                        ),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(
                          color: errorText != null ? const Color(0xFFEF4444) : const Color(0xFFFF5733),
                          width: 1.5,
                        ),
                      ),
                    ),
                  ),
                  if (errorText != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 5, left: 4),
                      child: Row(
                        children: [
                          const Icon(Icons.error_outline_rounded, size: 12, color: Color(0xFFEF4444)),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              errorText!,
                              style: const TextStyle(
                                fontFamily: 'Figtree',
                                fontSize: 11,
                                color: Color(0xFFEF4444),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }
}
