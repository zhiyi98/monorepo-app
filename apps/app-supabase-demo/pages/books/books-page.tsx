// app/books/books-page.tsx
'use client'

import {useEffect, useState} from 'react'
import {Button} from '@repo/core-shadcn-ui/components/ui/button'
import {Input} from '@repo/core-shadcn-ui/components/ui/input'
import {toast} from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/core-shadcn-ui/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/core-shadcn-ui/components/ui/dialog'
import {createClient} from "~/utils/supabase/component";

// 初始化 Supabase
const supabase = createClient()

// 增强样式变量
const styles = {
  container: 'max-w-6xl mx-auto p-6 space-y-6',
  header: 'flex justify-between items-center',
  table: 'rounded-lg border shadow-sm divide-y',
  dialog: 'sm:max-w-[600px]',
  inputGroup: 'space-y-4',
  loading: 'text-muted-foreground animate-pulse',
  button: {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    disabled: 'bg-muted text-muted-foreground cursor-not-allowed'
  },
  tableRow: 'hover:bg-accent/50 transition-colors'
}

// 类型定义
type Book = {
  id: string
  title: string
  author: string
  isbn: string
  published_year: number
  created_at: string
}

export default function BooksPage({
  session
}: {
  session: any
}) {
  // const { toast } = useToast()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [currentBook, setCurrentBook] = useState<Book | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    published_year: new Date().getFullYear()
  })

  // 初始数据加载
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const {data, error} = await supabase
          .from('books')
          .select('*')
          .order('created_at', {ascending: false})

        if (error) throw error
        setBooks(data || [])
      } catch (error) {
        toast("加载失败")
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [toast])

  // 提交处理
  const handleSubmit = async () => {
    if (!formData.title || !formData.author) {
      return toast("加载失败")
    }

    setSubmitting(true)
    try {
      if (currentBook) {
        // 更新操作
        const {error} = await supabase
          .from('books')
          .update(formData)
          .eq('id', currentBook.id)

        if (error) throw error
        setBooks(books.map(b => b.id === currentBook.id ? {...b, ...formData} : b))
        toast("更新成功")
      } else {
        // 新增操作
        const {data, error} = await supabase
          .from('books')
          .insert([formData])
          .select()
          .single()

        if (error) throw error
        setBooks([data, ...books])
        toast("更新成功")
      }
      setOpenDialog(false)
      resetForm()
    } catch (error) {
      toast("更新成功")
    } finally {
      setSubmitting(false)
    }
  }

  // 删除处理
  const handleDelete = async (id: string) => {
    try {
      const {error} = await supabase
        .from('books')
        .delete()
        .eq('id', id)

      if (error) throw error
      setBooks(books.filter(book => book.id !== id))
      toast("删除成功")
    } catch (error) {
      toast("删除失败")
    }
  }

  // 打开编辑对话框
  const openEditDialog = (book: Book) => {
    setCurrentBook(book)
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      published_year: book.published_year
    })
    setOpenDialog(true)
  }

  // 重置表单
  const resetForm = () => {
    setCurrentBook(null)
    setFormData({
      title: '',
      author: '',
      isbn: '',
      published_year: new Date().getFullYear()
    })
  }

  return (
    <div className={styles.container}>
      {/* 头部操作栏 */}
      <div className={styles.header}>
        <h1 className="text-3xl font-bold">图书管理</h1>
        <Button
          className={styles.button.primary}
          onClick={() => setOpenDialog(true)}
        >
          新增图书
        </Button>
      </div>

      {/* 数据表格 */}
      <div className={styles.table}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>书名</TableHead>
              <TableHead>作者</TableHead>
              <TableHead>ISBN</TableHead>
              <TableHead>出版年份</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  <span className={styles.loading}>加载中...</span>
                </TableCell>
              </TableRow>
            ) : books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              books.map((book) => (
                <TableRow key={book.id} className={styles.tableRow}>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.isbn}</TableCell>
                  <TableCell>{book.published_year}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(book)}
                    >
                      编辑
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(book.id)}
                    >
                      删除
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 新增/编辑对话框 */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className={styles.dialog}>
          <DialogHeader>
            <DialogTitle>
              {currentBook ? '编辑图书' : '新增图书'}
            </DialogTitle>
          </DialogHeader>

          <div className={styles.inputGroup}>
            <Input
              placeholder="书名 *"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
            <Input
              placeholder="作者 *"
              value={formData.author}
              onChange={(e) => setFormData({...formData, author: e.target.value})}
            />
            <Input
              placeholder="ISBN"
              value={formData.isbn}
              onChange={(e) => setFormData({...formData, isbn: e.target.value})}
            />
            <Input
              type="number"
              placeholder="出版年份"
              value={formData.published_year}
              onChange={(e) => setFormData({
                ...formData,
                published_year: Number(e.target.value) || 2023
              })}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDialog(false)}
              disabled={submitting}
            >
              取消
            </Button>
            <Button
              className={submitting ? styles.button.disabled : styles.button.primary}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? '处理中...' : currentBook ? '保存修改' : '创建图书'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}