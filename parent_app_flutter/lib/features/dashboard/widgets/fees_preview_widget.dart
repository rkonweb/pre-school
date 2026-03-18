import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import 'package:google_fonts/google_fonts.dart';

class FeesPreviewWidget extends StatelessWidget {
  final Map<String, dynamic>? feePreview;
  final VoidCallback onTap;

  const FeesPreviewWidget({Key? key, this.feePreview, required this.onTap}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color: AppTheme.goldBg,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppTheme.goldBorder),
        ),
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          color: AppTheme.goldAcc,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.account_balance_wallet_outlined, color: Colors.white, size: 16),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        'Fee Summary',
                        style: GoogleFonts.outfit(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.goldText,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF2F2), // red-50
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFFECACA)), // red-200
                    ),
                    child: const Text(
                      'Due Mar 31',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFEF4444), // red-500
                      ),
                    ),
                  ),
                ],
              ),
            ),
            
            // Body Details
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(20),
                  bottomRight: Radius.circular(20),
                ),
              ),
              child: feePreview != null 
                ? Column(
                    children: [
                      _buildFeeRow(
                         feePreview!['title'] ?? 'Fee Installment', 
                         feePreview!['description'] ?? 'Term Installment', 
                         '₹${feePreview!['amount']}', 
                         AppTheme.goldText
                      ),
                      
                      // Total Due
                      Container(
                        margin: const EdgeInsets.only(top: 16),
                        padding: const EdgeInsets.only(top: 16),
                        decoration: BoxDecoration(
                          border: Border(
                            top: BorderSide(
                              color: AppTheme.goldBorder.withOpacity(0.5),
                              style: BorderStyle.solid,
                              width: 1.5,
                            ),
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Total Due',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.goldText,
                              ),
                            ),
                            Text(
                              '₹${feePreview!['amount']}',
                              style: GoogleFonts.outfit(
                                fontSize: 18,
                                fontWeight: FontWeight.w900,
                                color: AppTheme.goldText,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  )
                : const Padding(
                    padding: EdgeInsets.symmetric(vertical: 8),
                    child: Center(
                      child: Text('All clear! No pending dues.', style: TextStyle(color: AppTheme.sageAcc, fontWeight: FontWeight.bold)),
                    ),
                  ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeeRow(String name, String due, String amount, Color amountColor) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              name,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: AppTheme.t1,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              due,
              style: const TextStyle(
                fontSize: 10,
                color: AppTheme.t3,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
        Text(
          amount,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w800,
            color: amountColor,
          ),
        ),
      ],
    );
  }
}
