import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/theme/school_brand_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../ui/components/app_header.dart';
import '../../dashboard/data/dashboard_provider.dart';
import '../data/library_provider.dart';
import '../models/library_transaction.dart';

class LibraryScreen extends ConsumerStatefulWidget {
  const LibraryScreen({super.key});

  @override
  ConsumerState<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends ConsumerState<LibraryScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(libraryProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppHeader(
        title: 'Library',
        subtitle: 'Borrowed books & reading history',
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: TabBar(
            controller: _tabController,
            indicatorColor: const Color(0xFF3B6EF8),
            labelColor: const Color(0xFF3B6EF8),
            unselectedLabelColor: const Color(0xFF64748B),
            labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            tabs: const [
              Tab(text: 'Currently Borrowed'),
              Tab(text: 'History'),
            ],
          ),
        ),
      ),
      body: state.isLoading && state.activeLoans.isEmpty && state.loanHistory.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : state.error != null
              ? _buildErrorState(state.error!)
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildBorrowedTab(state.activeLoans),
                    _buildHistoryTab(state.loanHistory),
                  ],
                ),
    );
  }

  Widget _buildBorrowedTab(List<LibraryTransaction> transactions) {
    if (transactions.isEmpty) {
      return RefreshIndicator(
        onRefresh: () => ref.read(libraryProvider.notifier).fetchStudentLibrary(),
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: [
            SizedBox(
              height: MediaQuery.of(context).size.height - 200,
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.library_books_outlined, size: 64, color: Colors.grey.shade300),
                    const SizedBox(height: 16),
                    Text(
                      'No books currently borrowed',
                      style: TextStyle(color: Colors.grey.shade600, fontSize: 16),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => ref.read(libraryProvider.notifier).fetchStudentLibrary(),
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 10, 20, 100),
        children: [
          const SizedBox(height: 10),
          ...transactions.asMap().entries.map((e) {
            final idx = e.key;
            final txn = e.value;
            return _buildBookCard(txn, idx).animate().fadeIn(delay: (100 + idx * 50).ms).slideY(begin: 0.1);
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildHistoryTab(List<LibraryTransaction> transactions) {
    if (transactions.isEmpty) {
      return RefreshIndicator(
        onRefresh: () => ref.read(libraryProvider.notifier).fetchStudentLibrary(),
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: [
            SizedBox(
              height: MediaQuery.of(context).size.height - 200,
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.history_outlined, size: 64, color: Colors.grey.shade300),
                    const SizedBox(height: 16),
                    Text(
                      'No borrowing history',
                      style: TextStyle(color: Colors.grey.shade600, fontSize: 16),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => ref.read(libraryProvider.notifier).fetchStudentLibrary(),
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 10, 20, 100),
        children: [
          const SizedBox(height: 10),
          ...transactions.asMap().entries.map((e) {
            final idx = e.key;
            final txn = e.value;
            return _buildHistoryCard(txn, idx).animate().fadeIn(delay: (100 + idx * 50).ms).slideY(begin: 0.1);
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildBookCard(LibraryTransaction txn, int index) {
    final isOverdue = txn.isOverdue;
    final daysLeft = txn.dueDate.difference(DateTime.now()).inDays;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isOverdue ? Colors.red.withOpacity(0.3) : const Color(0xFFE2E8F0)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8)],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 50,
            height: 70,
            decoration: BoxDecoration(
              color: const Color(0xFF3B6EF8).withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: txn.book.coverUrl != null
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(txn.book.coverUrl!, fit: BoxFit.cover),
                  )
                : const Icon(Icons.book_outlined, color: Color(0xFF3B6EF8), size: 28),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  txn.book.title,
                  style: GoogleFonts.sora(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF1E293B),
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  'by ${txn.book.author}',
                  style: GoogleFonts.dmSans(
                    fontSize: 12,
                    color: const Color(0xFF64748B),
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Icon(Icons.calendar_today_outlined, size: 13, color: const Color(0xFF94A3B8)),
                    const SizedBox(width: 4),
                    Text(
                      'Due ${DateFormat('MMM d').format(txn.dueDate)}',
                      style: GoogleFonts.dmSans(
                        fontSize: 11,
                        color: isOverdue ? Colors.red : const Color(0xFF94A3B8),
                        fontWeight: isOverdue ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                    const SizedBox(width: 12),
                    if (txn.fineAmount > 0) ...[
                      Icon(Icons.warning_outlined, size: 13, color: Colors.orange),
                      const SizedBox(width: 4),
                      Text(
                        '₹${txn.fineAmount.toStringAsFixed(0)} fine',
                        style: GoogleFonts.dmSans(
                          fontSize: 11,
                          color: Colors.orange,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: isOverdue
                  ? Colors.red.withOpacity(0.1)
                  : daysLeft <= 3
                      ? Colors.orange.withOpacity(0.1)
                      : Colors.green.withOpacity(0.1),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              isOverdue
                  ? 'Overdue'
                  : daysLeft <= 0
                      ? 'Due'
                      : '$daysLeft days',
              style: GoogleFonts.dmSans(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: isOverdue
                    ? Colors.red
                    : daysLeft <= 3
                        ? Colors.orange
                        : Colors.green,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryCard(LibraryTransaction txn, int index) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8)],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 50,
            height: 70,
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: const Icon(Icons.book_outlined, color: Color(0xFF94A3B8), size: 28),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  txn.book.title,
                  style: GoogleFonts.sora(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF1E293B),
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  'by ${txn.book.author}',
                  style: GoogleFonts.dmSans(
                    fontSize: 12,
                    color: const Color(0xFF64748B),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Returned ${txn.returnedDate != null ? DateFormat('MMM d, yyyy').format(txn.returnedDate!) : 'N/A'}',
                  style: GoogleFonts.dmSans(
                    fontSize: 11,
                    color: const Color(0xFF94A3B8),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.green.withOpacity(0.1),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              'Returned',
              style: GoogleFonts.dmSans(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: Colors.green,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(String error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 48, color: Colors.red),
          const SizedBox(height: 16),
          Text(error),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () => ref.read(libraryProvider.notifier).fetchStudentLibrary(),
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}
